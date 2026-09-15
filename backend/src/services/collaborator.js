import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import model from '../models/collaborator.js';
import { config } from '../../config.js';
import { jwt } from '../utils/jwt.js';
import Mail from '../utils/mail.js';
import { registration } from '../utils/html/registration.js';
import { recovery } from '../utils/html/recovery.js';
import { invitation } from '../utils/html/invitation.js';
import AuthenticationError from '../errors/authentication.js';
import AuthorizationError from '../errors/authorization.js';
import ConflictError from '../errors/conflict.js';
import InternalServerError from '../errors/internal_server.js';
import NotFoundError from '../errors/not_found.js';
import ValidationError from '../errors/validation.js';
import { checkDocumentUniqueness } from '../utils/check_document_uniqueness.js';
import CloudinaryError from '../errors/cloudinary.js';
import NodemailerError from '../errors/nodemailer.js';

const service = {

    async getAll() {
        return await model.find().lean();
    },

    async getById(id) {
        const collaborator = await model.findById(id);
        if (!collaborator) throw new NotFoundError(
            'colaborador no encontrado',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id }
        );
        return collaborator;
    },

    async invite({ name, lastname, email, document, phone, picture, picture_id }) {
        const exists = await model.findOne({ email });
        if (exists) {
            if (!exists.verified_email) {
                await model.findByIdAndDelete(exists._id);
            } else {
                throw new ConflictError(
                    'ya existe una cuenta de colaborador registrada con este correo electrónico',
                    { code: 'EMAIL_ALREADY_EXISTS', field: 'email', value: email }
                );
            }
        }
        // si una invitación anterior (sin completar) se quedó con el mismo número
        // de documento, se descarta ese registro huérfano antes de validar
        // unicidad, para que no bloquee la invitación real
        const existingByDocument = await model.findOne({ 'document.number': document.number });
        if (existingByDocument && !existingByDocument.verified_email) {
            await model.findByIdAndDelete(existingByDocument._id);
        }
        // lo mismo que dice en el service de clientes qué pereza volver a escribirlo
        await checkDocumentUniqueness(document.number);
        const collaborator = await model.create({
            name,
            lastname,
            email,
            document,
            phone,
            picture,
            picture_id,
            verified_email: false,
        });
        const token = jwt.sign({ id: collaborator._id }, '15m');
        const inviteLink = `${config.app.frontend_url}/collaborator/complete-invitation?token=${token}`;
        try {
            await Mail.sendHtml(
                collaborator.email,
                'Completar cuenta',
                `Haga click aquí para completar su registro: ${inviteLink}`,
                invitation({ name: collaborator.name, link: inviteLink, role: 'colaborador' })
            );
        } catch (error) {
            console.log('Mail.send() failed', error);
            throw new NodemailerError(
                'no se pudo enviar el correo de invitación',
                { email: collaborator.email }
            )
        }
        return { collaborator, token };
    },

    async completeInvitation({ token, password, confirm_password }) {
        let decoded;
        try {
            decoded = jwt.verify(token);
        } catch {
            throw new AuthenticationError(
                'el enlace de invitación es inválido o ha expirado'
            );
        }
        const collaborator = await model.findById(decoded.id);
        if (!collaborator) throw new NotFoundError(
            'el colaborador no existe',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id: decoded.id }
        );
        if (collaborator.verified_email) throw new ConflictError(
            'esta invitación ya fue completada anteriormente',
            { code: 'INVITATION_ALREADY_COMPLETED', resource: 'collaborator', id: collaborator._id }
        );
        collaborator.password = password;
        collaborator.verified_email = true;
        await collaborator.save();
        const authToken = jwt.sign({ id: collaborator._id, role: 'collaborator' }, '30d');
        return {
            token: authToken,
            collaborator: {
                id: collaborator._id,
                name: collaborator.name,
                lastname: collaborator.lastname,
                email: collaborator.email,
                picture: collaborator.picture,
            },
        };
    },

    async update(id, updates) {
        const collaborator = await model.findByIdAndUpdate(id, updates, { new: true });
        if (!collaborator) throw new NotFoundError(
            'colaborador no encontrado',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id }
        );
        return collaborator;
    },

    async delete(id) {
        const collaborator = await model.findByIdAndDelete(id);
        if (!collaborator) throw new NotFoundError(
            'colaborador no encontrado',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id }
        );
        return { id, deleted: true };
    },

    async uploadPicture(id, { picture, picture_id }) {
        const collaborator = await model.findById(id);
        if (!collaborator) throw new NotFoundError(
            'colaborador no encontrado',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id }
        );
        if (collaborator.picture_id) {
            try {
                await cloudinary.uploader.destroy(collaborator.picture_id);
            } catch (err) {
                throw new CloudinaryError(
                    'no se pudo eliminar la foto de perfil anterior',
                    { previous_picture_id: collaborator.picture_id }
                );
            }
        }
        collaborator.picture = picture;
        collaborator.picture_id = picture_id;
        await collaborator.save();
        return {
            id: collaborator._id,
            picture: collaborator.picture,
            picture_id: collaborator.picture_id
        };
    },

    async requestRecoveryCode({ email }) {
        if (!email?.trim()) throw new ValidationError(
            'el correo electrónico es obligatorio',
            { code: 'EMAIL_REQUIRED', field: 'email' });
        const collaborator = await model.findOne({ email });
        if (!collaborator) throw new AuthenticationError(
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
        if (!new_password) throw new ValidationError('la contraseña es obligatoria',
            { code: 'PASSWORD_REQUIRED', field: 'new_password' }
        );
        if (!confirm_password) throw new ValidationError('debe confirmar la contraseña',
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
        const collaborator = await model.findOneAndUpdate(
            { email: decoded.email },
            { password: hash },
            { new: true }
        );
        if (!collaborator) throw new NotFoundError(
            'colaborador no encontrado',
            { code: 'COLLABORATOR_NOT_FOUND', email: decoded.email }
        );
        return { id: collaborator._id, message: 'contraseña actualizada correctamente' };
    },

    async login({ email, password }) {
        const collaborator = await model.findOne({ email }).select('+password');
        if (!collaborator) throw new AuthenticationError(
            'correo electrónico o contraseña incorrectos'
        );
        const isMatch = await collaborator.comparePassword(password);
        if (!isMatch) throw new AuthenticationError(
            'correo electrónico o contraseña incorrectos'
        );
        if (!collaborator.verified_email) throw new AuthorizationError(
            'debe verificar su correo electrónico antes de iniciar sesión',
            { code: 'EMAIL_NOT_VERIFIED', field: 'email' }
        );
        const token = jwt.sign({ id: collaborator._id, role: 'collaborator' }, '30d');
        return {
            token,
            collaborator: {
                id: collaborator._id,
                name: collaborator.name,
                lastname: collaborator.lastname,
                email: collaborator.email,
                picture: collaborator.picture,
            },
        };
    },

    async logout() { return },
};

export default service;