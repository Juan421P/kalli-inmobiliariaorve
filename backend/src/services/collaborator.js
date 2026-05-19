import Service from './service.js';
import model from '../models/collaborator.js';
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
class CollaboratorService extends Service {
    constructor() {
        super();
        this.model = model;
    }
    async beforeCreate(data, context) {
        const exists = await this.model.findOne({ email: data.email });
        if (exists) throw new ConflictError('collaborator already exists');
        if (!context.file) throw new NotFoundError('image not found');
        data.picture = context.file.path;
        data.picture_id = context.file.filename;
        data.verified_email = false;
        delete data.password;
    }
    async afterCreate(collaborator) {
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { id: collaborator._id, code },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        await Mail.sendHtml(
            collaborator.email,
            'Completar cuenta',
            `Dispone usted de 15 minutos para activar su cuenta con este código: ${code}`,
            registration(code)
        );
        return token;
    }
    async completeInvitation(token, code, password) {
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (decoded.code !== code) throw new AuthorizationError('incorrect code');
        const collaborator = await this.model.findById(decoded.id);
        if (!collaborator) throw new NotFoundError('collaborator not found');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        collaborator.password = hash;
        collaborator.verified_email = true;
        await collaborator.save();
        return collaborator;
    }
    async authenticate(email, password) {
        const collaborator = await this.model.findOne({ email }).select('+password');
        if (!collaborator) throw new AuthorizationError('invalid credentials');
        if (!collaborator.verified_email) throw new AuthorizationError('email not verified');
        const isMatch = await collaborator.comparePassword(password);
        if (!isMatch) throw new AuthorizationError('invalid credentials');
        return jsonwebtoken.sign(
            { id: collaborator._id },
            config.jwt.secret,
            { expiresIn: '30d' }
        );
    }
    async uploadPicture(id, file) {
        if (!file) throw new NotFoundError('image not found');
        const collaborator = await this.model.findById(id);
        if (!collaborator) throw new NotFoundError('collaborator not found');
        if (collaborator.picture_id) await cloudinary.uploader.destroy(collaborator.picture_id);
        collaborator.picture = file.path;
        collaborator.picture_id = file.filename;
        await collaborator.save();
        return collaborator;
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
        const collaborator = await this.model.findOneAndUpdate(
            { email },
            { password: hash },
            { new: true }
        );
        if (!collaborator) throw new NotFoundError('collaborator not found');
        return collaborator;
    }
}
export default new CollaboratorService();