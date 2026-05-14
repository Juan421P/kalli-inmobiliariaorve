import Service from './service.js';
import model from '../models/collaborator.js';
import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../../config.js';
import { sendMail } from '../utils/mailer.js';
import { registration, recovery } from '../utils/email_templates.js';
class CollaboratorService extends Service {
    constructor() {
        super();
        this.model = model;
    }
    async authenticate(email, password) {
        const collaborator = await this.model.findOne({ email }).select('+password');
        if (!collaborator) throw new Error('collaborator not found');
        const isMatch = await collaborator.comparePassword(password);
        if (!isMatch) throw new Error('invalid credentials');
        return jsonwebtoken.sign(
            { id: collaborator._id },
            config.jwt.secret,
            { expiresIn: '30d' }
        );
    }
    async prepareRegistration(data) {
        const exists = await this.model.findOne({ email: data.email });
        if (exists) throw new Error('collaborator already exists');
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign({ ...data, code }, config.jwt.secret, { expiresIn: '15m' });
        await sendMail(
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
        if (!found) throw new Error('collaborator does not exist');
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign({ email, code, isVerified: false }, config.jwt.secret, { expiresIn: '15m' });
        await sendMail(
            email,
            'Recuperación de contraseña',
            `Dispone usted de 15 minutos para recuperar su cuenta con este código: ${code}`,
            recovery(code)
        );
        return { token, code };
    }
    async completeRecovery(token, inputCode) {
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (inputCode !== decoded.code) throw new Error('incorrect code');
        return jsonwebtoken.sign(
            { email: decoded.email, isVerified: true },
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
        if (!collaborator) throw new Error('error updating password');
        return collaborator;
    }
}
export default new CollaboratorService();