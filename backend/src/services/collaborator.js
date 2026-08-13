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
            'collaborator not found',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id }
        );
        return collaborator;
    },

    async invite({ name, lastname, email, document, phone, picture, picture_id }) {
        const exists = await model.findOne({ email });
        if (exists) throw new ConflictError(
            'collaborator already exists',
            { code: 'EMAIL_ALREADY_EXISTS', field: 'email', value: email }
        );
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
                'failed to send invitation email',
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
                'invalid or expired invitation token',
                { code: 'INVALID_INVITATION_TOKEN' }
            );
        }
        const collaborator = await model.findById(decoded.id);
        if (!collaborator) throw new NotFoundError(
            'collaborator does not exist',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id: decoded.id }
        );
        if (collaborator.verified_email) throw new ConflictError(
            'invitation already completed',
            { code: 'INVITATION_ALREADY_COMPLETED', resource: 'collaborator', id: collaborator._id }
        );
        collaborator.password = await bcrypt.hash(password, 10);
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
            'collaborator not found',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id }
        );
        return collaborator;
    },

    async delete(id) {
        const collaborator = await model.findByIdAndDelete(id);
        if (!collaborator) throw new NotFoundError(
            'collaborator not found',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id }
        );
        return { id, deleted: true };
    },

    async uploadPicture(id, { picture, picture_id }) {
        const collaborator = await model.findById(id);
        if (!collaborator) throw new NotFoundError(
            'collaborator not found',
            { code: 'COLLABORATOR_NOT_FOUND', resource: 'collaborator', id }
        );
        if (collaborator.picture_id) {
            try {
                await cloudinary.uploader.destroy(collaborator.picture_id);
            } catch (err) {
                throw new CloudinaryError(
                    'failed to remove previous picture',
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
            'email is required',
            { code: 'EMAIL_REQUIRED', field: 'email' });
        const collaborator = await model.findOne({ email });
        if (!collaborator) throw new AuthenticationError(
            'invalid credentials',
            { code: 'INVALID_CREDENTIALS' }
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
                'failed to send recovery email',
                { email }
            );
        }
        return { token, expiresIn: 900 };
    },

    async verifyRecoveryCode({ token, code }) {
        if (!token) throw new AuthenticationError(
            'session expired',
            { code: 'RECOVERY_SESSION_MISSING' }
        );
        if (!code?.trim()) throw new ValidationError(
            'code is required',
            { code: 'CODE_REQUIRED', field: 'code' }
        );
        let decoded;
        try {
            decoded = jwt.verify(token);
        } catch {
            throw new AuthenticationError(
                'invalid or expired recovery token',
                { code: 'INVALID_RECOVERY_TOKEN' }
            );
        }
        if (decoded.code !== code) throw new AuthorizationError(
            'incorrect code',
            { code: 'INVALID_RECOVERY_CODE', field: 'code' }
        );
        const newToken = jwt.sign({ email: decoded.email, verified_email: true }, '15m');
        return { token: newToken, expiresIn: 900 };
    },

    async changePassword({ token, new_password, confirm_password }) {
        if (!token) throw new AuthenticationError('session expired',
            { code: 'RECOVERY_SESSION_MISSING' }
        );
        if (!new_password) throw new ValidationError('password is required',
            { code: 'PASSWORD_REQUIRED', field: 'new_password' }
        );
        if (!confirm_password) throw new ValidationError('confirm_password is required',
            { code: 'CONFIRM_PASSWORD_REQUIRED', field: 'confirm_password' }
        );
        if (new_password !== confirm_password) throw new ValidationError(
            'passwords do not match',
            { code: 'PASSWORDS_DO_NOT_MATCH', fields: ['new_password', 'confirm_password'] }
        );
        let decoded;
        try {
            decoded = jwt.verify(token);
        } catch {
            throw new AuthenticationError(
                'invalid or expired recovery token',
                { code: 'INVALID_RECOVERY_TOKEN' }
            );
        }
        if (!decoded.verified_email) throw new AuthorizationError(
            'account not verified for password change',
            { code: 'RECOVERY_NOT_VERIFIED', email: decoded.email }
        );
        const hash = await bcrypt.hash(new_password, 10);
        const collaborator = await model.findOneAndUpdate(
            { email: decoded.email },
            { password: hash },
            { new: true }
        );
        if (!collaborator) throw new NotFoundError(
            'collaborator not found',
            { code: 'COLLABORATOR_NOT_FOUND', email: decoded.email }
        );
        return { id: collaborator._id, message: 'password updated successfully' };
    },

    async login({ email, password }) {
        const collaborator = await model.findOne({ email }).select('+password');
        if (!collaborator) throw new AuthenticationError(
            'invalid credentials',
            { code: 'INVALID_CREDENTIALS' }
        );
        const isMatch = await collaborator.comparePassword(password);
        if (!isMatch) throw new AuthenticationError(
            'invalid credentials',
            { code: 'INVALID_CREDENTIALS' }
        );
        if (!collaborator.verified_email) throw new AuthorizationError(
            'email not yet verified',
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