import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import model from '../models/client.js';
import { jwt } from '../utils/jwt.js';
import Mail from '../utils/mail.js';
import { registration } from '../utils/html/registration.js';
import { recovery } from '../utils/html/recovery.js';
import { checkDocumentUniqueness } from '../utils/check_document_uniqueness.js';
import AuthenticationError from '../errors/authentication.js';
import AuthorizationError from '../errors/authorization.js';
import ConflictError from '../errors/conflict.js';
import NotFoundError from '../errors/not_found.js';
import ValidationError from '../errors/validation.js';
import CloudinaryError from '../errors/cloudinary.js';
import NodemailerError from '../errors/nodemailer.js';

const service = {

    async getAll() {
        return await model.find().lean();
    },

    async getById(id) {
        const client = await model.findById(id);
        if (!client) throw new NotFoundError(
            'cliente no encontrado',
            { code: 'CLIENT_NOT_FOUND', resource: 'client', id }
        );
        return client;
    },

    async register({ name, lastname, email, document, phone, picture, pictureId, password }) {
        const exists = await model.findOne({ email });
        if (exists) {
            if (!exists.verified_email) {
                await model.findByIdAndDelete(exists._id);
            } else {
                throw new ConflictError(
                    'ya existe una cuenta registrada con este correo electrónico',
                    { code: 'EMAIL_ALREADY_EXISTS', field: 'email', value: email }
                );
            }
        }
        // si un intento anterior (sin verificar) se quedó con el mismo número de
        // documento -p.ej. el usuario se equivocó de correo y ahora se registra
        // con el correcto-, se descarta ese registro huérfano antes de validar
        // unicidad, para que no bloquee el registro real
        const existingByDocument = await model.findOne({ 'document.number': document.number });
        if (existingByDocument && !existingByDocument.verified_email) {
            await model.findByIdAndDelete(existingByDocument._id);
        }
        // igual no serviría si se registran varios usuarios con el mismo número de dui al mismo tiempo o algo así pero esperemos que tal cosa no ocurra porque si no habría que hacer otra colección y ajá no creo que haya otra forma y la verdad qué pereza mil disculpas
        await checkDocumentUniqueness(document.number);
        const client = await model.create({
            name,
            lastname,
            email,
            document,
            phone: { country_code: phone.country_code, number: phone.number },
            picture,
            picture_id: pictureId,
            password,
            verified_email: false,
        });
        const code = crypto.randomBytes(3).toString('hex');
        const token = jwt.sign({ id: client._id, code }, '15m');
        try {
            await Mail.sendHtml(
                client.email,
                'Confirmación de correo',
                `Dispone usted de 15 minutos para activar su cuenta con este código: ${code}`,
                registration(code)
            );
        } catch (err) {
            console.error('[client.register] Mail.sendHtml failed:', err);
            await model.findByIdAndDelete(client._id);
            throw new NodemailerError(
                'no se pudo enviar el correo de verificación',
                { email: client.email }
            );
        }
        return { client, token };
    },

    async resendVerification({ email }) {
        const client = await model.findOne({ email });
        if (!client) throw new NotFoundError(
            'cliente no encontrado',
            { code: 'CLIENT_NOT_FOUND' }
        );
        if (client.verified_email) throw new ConflictError(
            'esta cuenta ya fue verificada',
            { code: 'ACCOUNT_ALREADY_VERIFIED' }
        );
        const code = crypto.randomBytes(3).toString('hex');
        const token = jwt.sign({ id: client._id, code }, '15m');
        try {
            await Mail.sendHtml(
                client.email,
                'Confirmación de correo',
                `Dispone usted de 15 minutos para activar su cuenta con este código: ${code}`,
                registration(code)
            );
        } catch (err) {
            console.error('[client.resendVerification] Mail.sendHtml failed:', err);
            throw new NodemailerError(
                'no se pudo enviar el correo de verificación',
                { email: client.email }
            );
        }
        return { token, expiresIn: 900 };
    },

    async verifyEmail({ token, code }) {
        let decoded;
        try {
            decoded = jwt.verify(token);
        } catch {
            throw new AuthenticationError(
                'el código de verificación es inválido o ha expirado'
            );
        }
        if (decoded.code !== code) throw new AuthenticationError(
            'el código de verificación es incorrecto'
        );
        const client = await model.findById(decoded.id);
        if (!client) throw new NotFoundError(
            'el cliente no existe',
            { code: 'CLIENT_NOT_FOUND', resource: 'client', id: decoded.id }
        );
        if (client.verified_email) throw new ConflictError(
            'esta cuenta ya fue verificada',
            { code: 'ACCOUNT_ALREADY_VERIFIED', resource: 'client', id: client._id }
        );
        client.verified_email = true;
        await client.save();
        const session_token = jwt.sign({ id: client._id, role: 'client', v: client.session_version }, '30d');

        return {
            token: session_token,
            client: {
                id: client._id,
                name: client.name,
                lastname: client.lastname,
                email: client.email,
                picture: client.picture,
            },
        };
    },

    async update(id, updates) {
        const client = await model.findByIdAndUpdate(id, updates, { new: true });
        if (!client) throw new NotFoundError(
            'cliente no encontrado',
            { code: 'CLIENT_NOT_FOUND', resource: 'client', id }
        );
        return client;
    },

    async delete(id) {
        const client = await model.findByIdAndDelete(id);
        if (!client) throw new NotFoundError(
            'cliente no encontrado',
            { code: 'CLIENT_NOT_FOUND', resource: 'client', id }
        );
        return { id, deleted: true };
    },

    async uploadPicture(id, { picture, picture_id }) {
        const client = await model.findById(id);
        if (!client) throw new NotFoundError(
            'cliente no encontrado',
            { code: 'CLIENT_NOT_FOUND', resource: 'client', id }
        );
        if (client.picture_id) {
            try {
                await cloudinary.uploader.destroy(client.picture_id);
            } catch (err) {
                throw new CloudinaryError(
                    'no se pudo eliminar la foto de perfil anterior',
                    { previous_picture_id: client.picture_id }
                );
            }
        }
        client.picture = picture;
        client.picture_id = picture_id;
        await client.save();
        return {
            id: client._id,
            picture: client.picture,
            picture_id: client.picture_id
        };
    },

    async requestRecoveryCode({ email }) {
        if (!email?.trim()) throw new ValidationError(
            'el correo electrónico es obligatorio',
            { code: 'EMAIL_REQUIRED', field: 'email' }
        );
        const client = await model.findOne({ email });
        if (!client) throw new AuthenticationError(
            'no existe ninguna cuenta con ese correo electrónico'
        );
        const code = crypto.randomBytes(3).toString('hex');
        const token = jwt.sign({ email, code, verified_email: false }, '15m');
        try {
            await Mail.sendHtml(
                email,
                'Recuperación de contraseña',
                `Dispone usted de 15 minutos para recuperar su cuenta con este código: ${code}`,
                recovery(code)
            );
        } catch (err) {
            console.error('[client.requestRecoveryCode] Mail.sendHtml failed:', err);
            throw new NodemailerError(
                'no se pudo enviar el correo de recuperación',
                { email }
            );
        }
        return { token, expiresIn: 900 };
    },

    async verifyRecoveryCode({ token, code }) {
        if (!token) throw new AuthenticationError(
            'la sesión de recuperación ha expirado, solicite un nuevo código'
        );
        if (!code?.trim()) throw new ValidationError(
            'el código es obligatorio',
            { code: 'CODE_REQUIRED', field: 'code' }
        );
        let decoded;
        try {
            decoded = jwt.verify(token);
        } catch {
            throw new AuthenticationError(
                'el código de recuperación es inválido o ha expirado'
            );
        }
        if (decoded.code !== code) throw new AuthorizationError(
            'el código ingresado es incorrecto',
            { code: 'INVALID_RECOVERY_CODE', field: 'code' }
        );
        const newToken = jwt.sign({ email: decoded.email, verified_email: true }, '15m');
        return { token: newToken, expiresIn: 900 };
    },

    async changePassword({ token, new_password, confirm_password }) {
        if (!token) throw new AuthenticationError(
            'la sesión de recuperación ha expirado, solicite un nuevo código'
        );
        if (!new_password) throw new ValidationError(
            'la contraseña es obligatoria',
            { code: 'PASSWORD_REQUIRED', field: 'new_password' }
        );
        if (!confirm_password) throw new ValidationError(
            'debe confirmar la contraseña',
            { code: 'CONFIRM_PASSWORD_REQUIRED', field: 'confirm_password' }
        );
        if (new_password !== confirm_password) throw new ValidationError(
            'las contraseñas no coinciden',
            { code: 'PASSWORDS_DO_NOT_MATCH', fields: ['new_password', 'confirm_password'] }
        );
        let decoded;
        try {
            decoded = jwt.verify(token);
        } catch {
            throw new AuthenticationError(
                'el código de recuperación es inválido o ha expirado'
            );
        }
        if (!decoded.verified_email) throw new AuthorizationError(
            'debe verificar el código de recuperación antes de cambiar la contraseña',
            { code: 'RECOVERY_NOT_VERIFIED', email: decoded.email }
        );
        const hash = await bcrypt.hash(new_password, 10);
        const client = await model.findOneAndUpdate(
            { email: decoded.email },
            { password: hash },
            { new: true }
        );
        if (!client) throw new NotFoundError(
            'cliente no encontrado',
            { code: 'CLIENT_NOT_FOUND', email: decoded.email }
        );
        return { id: client._id, message: 'contraseña actualizada correctamente' };
    },

    async login({ email, password }) {
        const client = await model.findOne({ email }).select('+password');
        if (!client) throw new AuthenticationError(
            'correo electrónico o contraseña incorrectos'
        );
        const isMatch = await client.comparePassword(password);
        if (!isMatch) throw new AuthenticationError(
            'correo electrónico o contraseña incorrectos'
        );
        if (!client.verified_email) throw new AuthorizationError(
            'debe verificar su correo electrónico antes de iniciar sesión',
            { code: 'EMAIL_NOT_VERIFIED', field: 'email' }
        );
        const token = jwt.sign({ id: client._id, role: 'client', v: client.session_version }, '30d');
        return {
            token,
            client: {
                id: client._id,
                name: client.name,
                lastname: client.lastname,
                email: client.email,
                picture: client.picture,
            },
        };
    },

    async logout() { return },

    // Invalida todas las sesiones activas del cliente (incluida la actual):
    // al subir session_version, cualquier token ya emitido (que lleva el
    // número anterior) deja de pasar la validación en require_auth.js.
    async logoutAllSessions(id) {
        const client = await model.findByIdAndUpdate(
            id,
            { $inc: { session_version: 1 } },
            { new: true }
        );
        if (!client) throw new NotFoundError(
            'cliente no encontrado',
            { code: 'CLIENT_NOT_FOUND', resource: 'client', id }
        );
        return { id: client._id };
    },

};
export default service;