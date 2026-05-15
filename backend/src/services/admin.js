import Service from './service.js';
import model from '../models/admin.js';
import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
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
    async authenticate(email, password) {
        const admin = await this.model.findOne({ email }).select('+password');
        if (!admin) throw new AuthorizationError('invalid credentials');
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) throw new AuthorizationError('invalid credentials');
        return jsonwebtoken.sign(
            { id: admin._id },
            config.jwt.secret,
            { expiresIn: '30d' }
        );
    }
    async prepareRegistration(data) {
        const exists = await this.model.findOne({
            email: data.email
        });
        if (exists) throw new ConflictError('admin already exists');
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { ...data, code },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        await Mail.sendHtml(
            data.email,
            'Confirmación de correo',
            `Dispone usted de 15 minutos para activar su cuenta con este código: ${code}`,
            registration(code)
        );
        return token;
    }
    async completeRegistration(decodedData) {
        return await this.create({
            ...decodedData,
            verified_email: true
        });
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
        return { token, code };
    }
    async completeRecovery(token, inputCode) {
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (inputCode !== decoded.code) throw new AuthorizationError('incorrect code');
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