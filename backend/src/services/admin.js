import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import model from '../models/admin.js';
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
import { findEmailInOtherRole, roleLabel } from '../utils/check_cross_role_login.js';
import CloudinaryError from '../errors/cloudinary.js';
import NodemailerError from '../errors/nodemailer.js';

const service = {

    async getAll() {
        return await model.find().lean();
    },

    async getById(id) {
        const admin = await model.findById(id);
        if (!admin) throw new NotFoundError(
            'administrador no encontrado',
            { code: 'ADMIN_NOT_FOUND', resource: 'admin', id }
        );
        return admin;
    },

    async invite({ name, lastname, email, document, phone, picture, picture_id }) {
        const exists = await model.findOne({ email });
        if (exists) {
            if (!exists.verified_email) {
                await model.findByIdAndDelete(exists._id);
            } else {
                throw new ConflictError(
                    'ya existe una cuenta de administrador registrada con este correo electrónico',
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
        const admin = await model.create({
            name,
            lastname,
            email,
            document,
            phone,
            picture,
            picture_id,
            verified_email: false,
        });
        const token = jwt.sign({ id: admin._id }, '15m');
        const inviteLink = `${config.app.frontend_url}/admin/complete-invitation?token=${token}`;
        try {
            await Mail.sendHtml(
                admin.email,
                'Completar cuenta',
                `Haga click aquí para completar su registro: ${inviteLink}`,
                invitation({ name: admin.name, link: inviteLink, role: 'administrador' })
            );
        } catch (error) {
            console.log('Mail.send() failed', error);
            throw new NodemailerError(
                'no se pudo enviar el correo de invitación',
                { email: admin.email }
            )
        }
        return { admin, token };
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
        const admin = await model.findById(decoded.id);
        if (!admin) throw new NotFoundError(
            'el administrador no existe',
            { code: 'ADMIN_NOT_FOUND', resource: 'admin', id: decoded.id }
        );
        if (admin.verified_email) throw new ConflictError(
            'esta invitación ya fue completada anteriormente',
            { code: 'INVITATION_ALREADY_COMPLETED', resource: 'admin', id: admin._id }
        );
        admin.password = password;
        admin.verified_email = true;
        await admin.save();
        const authToken = jwt.sign({ id: admin._id, role: 'admin' }, '30d');
        return {
            token: authToken,
            admin: {
                id: admin._id,
                name: admin.name,
                lastname: admin.lastname,
                email: admin.email,
                picture: admin.picture,
            },
        };
    },

    async update(id, updates) {
        const admin = await model.findByIdAndUpdate(id, updates, { new: true });
        if (!admin) throw new NotFoundError(
            'administrador no encontrado',
            { code: 'ADMIN_NOT_FOUND', resource: 'admin', id }
        );
        return admin;
    },

    async delete(id) {
        const admin = await model.findByIdAndDelete(id);
        if (!admin) throw new NotFoundError(
            'administrador no encontrado',
            { code: 'ADMIN_NOT_FOUND', resource: 'admin', id }
        );
        return { id, deleted: true };
    },

    async uploadPicture(id, { picture, picture_id }) {
        const admin = await model.findById(id);
        if (!admin) throw new NotFoundError(
            'administrador no encontrado',
            { code: 'ADMIN_NOT_FOUND', resource: 'admin', id }
        );
        if (admin.picture_id) {
            try {
                await cloudinary.uploader.destroy(admin.picture_id);
            } catch (err) {
                throw new CloudinaryError(
                    'no se pudo eliminar la foto de perfil anterior',
                    { previous_picture_id: admin.picture_id }
                );
            }
        }
        admin.picture = picture;
        admin.picture_id = picture_id;
        await admin.save();
        return {
            id: admin._id,
            picture: admin.picture,
            picture_id: admin.picture_id
        };
    },

    async requestRecoveryCode({ email }) {
        if (!email?.trim()) throw new ValidationError(
            'el correo electrónico es obligatorio',
            { code: 'EMAIL_REQUIRED', field: 'email' });
        const admin = await model.findOne({ email });
        if (!admin) throw new AuthenticationError(
            'no existe ninguna cuenta de administrador con ese correo electrónico'
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
        const admin = await model.findOneAndUpdate(
            { email: decoded.email },
            { password: hash },
            { new: true }
        );
        if (!admin) throw new NotFoundError(
            'administrador no encontrado',
            { code: 'ADMIN_NOT_FOUND', email: decoded.email }
        );
        return { id: admin._id, message: 'contraseña actualizada correctamente' };
    },

    async login({ email, password }) {
        const admin = await model.findOne({ email }).select('+password');
        if (!admin) {
            const otherRole = await findEmailInOtherRole(email, 'admin');
            if (otherRole) throw new AuthenticationError(
                `este correo pertenece a una cuenta de ${roleLabel(otherRole)}, inicie sesión desde la sección correspondiente`
            );
            throw new AuthenticationError('correo electrónico o contraseña incorrectos');
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) throw new AuthenticationError(
            'correo electrónico o contraseña incorrectos'
        );
        if (!admin.verified_email) throw new AuthorizationError(
            'debe verificar su correo electrónico antes de iniciar sesión',
            { code: 'EMAIL_NOT_VERIFIED', field: 'email' }
        );
        const token = jwt.sign({ id: admin._id, role: 'admin' }, '30d');
        return {
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                lastname: admin.lastname,
                email: admin.email,
                picture: admin.picture,
            },
        };
    },

    async logout() { return },
};

export default service;