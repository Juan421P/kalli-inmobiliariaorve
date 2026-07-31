import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import model from '../models/client.js';
import { config } from '../../config.js';
import Mail from '../utils/mail.js';
import { registration } from '../utils/html/registration.js';
import { recovery } from '../utils/html/recovery.js';
import { checkDocumentUniqueness } from '../utils/check_document_uniqueness.js';
import AuthenticationError from '../errors/authentication.js';
import AuthorizationError from '../errors/authorization.js';
import ConflictError from '../errors/conflict.js';
import InternalServerError from '../errors/internal_server.js';
import NotFoundError from '../errors/not_found.js';
import ValidationError from '../errors/validation.js';

const service = {

    async getAll() {
        return await model.find().lean();
    },

    async getById(id) {
        const client = await model.findById(id);
        if (!client) throw new NotFoundError(
            'client not found', {
            code: 'CLIENT_NOT_FOUND',
            resource: 'client',
            id
        });
        return client;
    },

    async register({ name, lastname, email, document, phone, picture, picture_id, password }) {
        const exists = await model.findOne({ email });
        if (exists) throw new ConflictError(
            'client already exists', {
            code: 'EMAIL_ALREADY_EXISTS',
            field: 'email',
            value: email
        });
        // igual no serviría si se registran varios usuarios con el mismo número de dui al mismo tiempo o algo así pero esperemos que tal cosa no ocurra porque si no habría que hacer otra colección y ajá no creo que haya otra forma y la verdad qué pereza mil disculpas
        await checkDocumentUniqueness(document.number);
        const client = await model.create({
            name,
            lastname,
            email,
            document,
            phone,
            picture,
            picture_id,
            password,
            verified_email: false,
        });
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { id: client._id, code },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        try {
            await Mail.sendHtml(
                client.email,
                'Confirmación de correo',
                `Dispone usted de 15 minutos para activar su cuenta con este código: ${code}`,
                registration(code)
            );
        } catch (err) {
            throw new InternalServerError(
                'failed to send verification email', {
                code: 'EMAIL_SEND_FAILED',
                email: client.email
            });
        }
        return { client, token };
    },

    async verifyEmail({ token, code }) {
        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.jwt.secret);
        } catch {
            throw new AuthenticationError(
                'invalid or expired verification token', {
                code: 'INVALID_VERIFICATION_TOKEN'
            });
        }
        if (decoded.code !== code) throw new AuthenticationError(
            'invalid verification code', {
            code: 'INVALID_VERIFICATION_CODE',
            field: 'code'
        });
        const client = await model.findById(decoded.id);
        if (!client) throw new NotFoundError(
            'client does not exist', {
            code: 'CLIENT_NOT_FOUND',
            resource: 'client',
            id: decoded.id
        });
        if (client.verified_email) throw new ConflictError(
            'account already verified', {
            code: 'ACCOUNT_ALREADY_VERIFIED',
            resource: 'client',
            id: client._id
        });
        client.verified_email = true;
        await client.save();
        const session_token = jsonwebtoken.sign(
            { id: client._id, role: 'client' },
            config.jwt.secret,
            { expiresIn: '30d' }
        );

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

    async update(id, { updates }) {
        const client = await model.findByIdAndUpdate(id, updates, { new: true });
        if (!client) throw new NotFoundError(
            'client not found', {
            code: 'CLIENT_NOT_FOUND',
            resource: 'client',
            id
        });
        return client;
    },

    async delete(id) {
        const client = await model.findByIdAndDelete(id);
        if (!client) throw new NotFoundError(
            'client not found', {
            code: 'CLIENT_NOT_FOUND',
            resource: 'client',
            id
        });
        return { id, deleted: true };
    },

    async uploadPicture(id, { picture, picture_id }) {
        const client = await model.findById(id);
        if (!client) throw new NotFoundError(
            'client not found', {
            code: 'CLIENT_NOT_FOUND',
            resource: 'client',
            id
        });
        if (client.picture_id) {
            try {
                await cloudinary.uploader.destroy(client.picture_id);
            } catch (err) {
                throw new InternalServerError(
                    'failed to remove previous picture', {
                    code: 'CLOUDINARY_DELETE_FAILED',
                    previous_picture_id: client.picture_id
                });
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
            'email is required', {
            code: 'EMAIL_REQUIRED',
            field: 'email'
        });
        const client = await model.findOne({ email });
        if (!client) throw new AuthenticationError(
            'invalid credentials', {
            code: 'INVALID_CREDENTIALS'
        });
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { email, code, verified_email: false },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        try {
            await Mail.sendHtml(
                email,
                'Recuperación de contraseña',
                `Dispone usted de 15 minutos para recuperar su cuenta con este código: ${code}`,
                recovery(code)
            );
        } catch (err) {
            throw new InternalServerError(
                'failed to send recovery email', {
                code: 'EMAIL_SEND_FAILED',
                email
            });
        }
        return { token, expiresIn: 900 };
    },

    async verifyRecoveryCode({ token, code }) {
        if (!token) throw new AuthenticationError(
            'session expired', {
            code: 'RECOVERY_SESSION_MISSING'
        });
        if (!code?.trim()) throw new ValidationError(
            'code is required', {
            code: 'CODE_REQUIRED',
            field: 'code'
        });
        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.jwt.secret);
        } catch {
            throw new AuthenticationError(
                'invalid or expired recovery token', {
                code: 'INVALID_RECOVERY_TOKEN'
            });
        }
        if (decoded.code !== code) throw new AuthorizationError(
            'incorrect code', {
            code: 'INVALID_RECOVERY_CODE',
            field: 'code'
        });
        const newToken = jsonwebtoken.sign(
            { email: decoded.email, verified_email: true },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        return { token: newToken, expiresIn: 900 };
    },

    async changePassword({ token, newPassword, confirmPassword }) {
        if (!token) throw new AuthenticationError('session expired', {
            code: 'RECOVERY_SESSION_MISSING'
        });
        if (!newPassword) throw new ValidationError('password is required', {
            code: 'PASSWORD_REQUIRED',
            field: 'newPassword'
        });
        if (!confirmPassword) throw new ValidationError('confirmPassword is required', {
            code: 'CONFIRM_PASSWORD_REQUIRED',
            field: 'confirmPassword'
        });
        if (newPassword !== confirmPassword) throw new ValidationError(
            'passwords do not match', {
            code: 'PASSWORDS_DO_NOT_MATCH',
            fields: ['newPassword', 'confirmPassword']
        });
        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.jwt.secret);
        } catch {
            throw new AuthenticationError(
                'invalid or expired recovery token', {
                code: 'INVALID_RECOVERY_TOKEN'
            });
        }
        if (!decoded.verified_email) throw new AuthorizationError(
            'account not verified for password change', {
            code: 'RECOVERY_NOT_VERIFIED',
            email: decoded.email
        });
        const hash = await bcrypt.hash(newPassword, 10);
        const client = await model.findOneAndUpdate(
            { email: decoded.email },
            { password: hash },
            { new: true }
        );
        if (!client) throw new NotFoundError(
            'client not found', {
            code: 'CLIENT_NOT_FOUND',
            email: decoded.email
        });
        return { id: client._id, message: 'password updated successfully' };
    },

    async login({ email, password }) {
        const client = await model.findOne({ email }).select('+password');
        if (!client) throw new AuthenticationError(
            'invalid credentials', {
            code: 'INVALID_CREDENTIALS'
        });
        const isMatch = await client.comparePassword(password);
        if (!isMatch) throw new AuthenticationError(
            'invalid credentials', {
            code: 'INVALID_CREDENTIALS'
        });
        if (!client.verified_email) throw new AuthorizationError(
            'email not yet verified', {
            code: 'EMAIL_NOT_VERIFIED',
            field: 'email'
        });
        const token = jsonwebtoken.sign(
            { id: client._id, role: 'client' },
            config.jwt.secret,
            { expiresIn: '30d' }
        );
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

};
export default service;