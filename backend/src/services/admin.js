import Service from './service.js';
import model from '../models/admin.js';
import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config.js';
import Mail from '../utils/mail.js';
import { registration } from '../utils/html/registration.js';
import { recovery } from '../utils/html/recovery.js';
import AuthorizationError from '../errors/authorization.js';
import ConflictError from '../errors/conflict.js';
import NotFoundError from '../errors/not_found.js';
class AdminService extends Service {
    constructor() {
        super();
        this.model = model;
    }
    async beforeCreate(data, context) {
        const exists = await this.model.findOne({ email: data.email });
        if (exists) throw new ConflictError('admin already exists');
        if (!context.file) throw new NotFoundError('image not found');
        data.picture = context.file.path;
        data.picture_id = context.file.filename;
        data.verified_email = false;
        delete data.password;
    }
    async afterCreate(admin) {
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { id: admin._id, code },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        await Mail.sendHtml(
            admin.email,
            'Completar cuenta',
            `Dispone usted de 15 minutos para activar su cuenta con este código: ${code}`,
            registration(code)
        );
        return token;
    }
    async completeInvitation(token, code, password) {
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (decoded.code !== code) throw new AuthorizationError('incorrect code');
        const admin = await this.model.findById(decoded.id);
        if (!admin) throw new NotFoundError('admin not found');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        admin.password = hash;
        admin.verified_email = true;
        await admin.save();
        return admin;
    }
    async authenticate(email, password) {
        const admin = await this.model.findOne({ email }).select('+password');
        if (!admin) throw new AuthorizationError('invalid credentials');
        if (!admin.verified_email) throw new AuthorizationError('email not verified');
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) throw new AuthorizationError('invalid credentials');
        return jsonwebtoken.sign(
            { id: admin._id },
            config.jwt.secret,
            { expiresIn: '30d' }
        );
    }
    async uploadPicture(id, file) {
        if (!file) throw new NotFoundError('image not found');
        const admin = await this.model.findById(id);
        if (!admin) throw new NotFoundError('admin not found');
        if (admin.picture_id) await cloudinary.uploader.destroy(admin.picture_id);
        admin.picture = file.path;
        admin.picture_id = file.filename;
        await admin.save();
        return admin;
    }
    async prepareRecovery(email) {
        const found = await this.model.findOne({ email });
        if (!found) throw new AuthorizationError('invalid credentials');
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { email, code, verified_email: false },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        await Mail.sendHtml(
            email,
            'Recuperación de contraseña',
            `Dispone usted de 15 minutos para recuperar su cuenta con este código: ${code}`,
            recovery(code)
        );
        return token;
    }
    async completeRecovery(token, inputCode) {
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (inputCode !== decoded.code)
            throw new AuthorizationError('incorrect code');
        return jsonwebtoken.sign(
            { email: decoded.email, verified_email: true },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
    }
    async resetPassword(email, newPassword) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        const admin = await this.model.findOneAndUpdate(
            { email },
            { password: hash },
            { new: true }
        );
        if (!admin) throw new NotFoundError('admin not found');
        return admin;
    }
}
export default new AdminService();