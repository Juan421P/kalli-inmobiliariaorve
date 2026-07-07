import jsonwebtoken from 'jsonwebtoken';
import model from '../models/client.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config.js';
import Mail from '../utils/mail.js';
import { registration } from '../utils/html/registration.js';
import { recovery } from '../utils/html/recovery.js';
import AuthenticationError from '../errors/authentication.js';
import AuthorizationError from '../errors/authorization.js';
import ConflictError from '../errors/conflict.js';
import NotFoundError from '../errors/not_found.js';
import { catchAsync } from '../utils/catch_async.js';
const controller = {
    get: catchAsync(async (req, res) => {
        const clients = await model.find();
        return res.status(200).json({ clients });
    }),
    getById: catchAsync(async (req, res) => {
        const client = await model.findById(req.params.id);
        if (!client) throw new NotFoundError('client not found');
        return res.status(200).json({ client });
    }),
    post: catchAsync(async (req, res) => {
        const exists = await model.findOne({ email: req.body.email });
        if (exists) throw new ConflictError('client already exists');
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { ...req.body, code },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        await Mail.sendHtml(
            req.body.email,
            'Confirmación de correo',
            `Dispone usted de 15 minutos para activar su cuenta con este código: ${code}`,
            registration(code)
        );
        res.cookie('c_verification', token, { maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: 'verification email sent' });
    }),
    verifyEmail: catchAsync(async (req, res) => {
        const { code } = req.body;
        const token = req.cookies.c_verification;
        if (!token) throw new AuthenticationError('session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (code !== decoded.code) throw new AuthorizationError('incorrect code');
        const client = new model({ ...decoded, verified_email: true });
        await client.save();
        res.clearCookie('c_verification');
        return res.status(201).json({ message: 'registration complete' });
    }),
    login: catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const client = await model.findOne({ email }).select('+password');
        if (!client) throw new AuthorizationError('invalid credentials');
        if (!client.active) throw new AuthorizationError('account deactivated');
        if (!client.verified_email) throw new AuthorizationError('email not verified');
        const isMatch = await client.comparePassword(password);
        if (!isMatch) throw new AuthorizationError('invalid credentials');
        const token = jsonwebtoken.sign(
            { id: client._id },
            config.jwt.secret,
            { expiresIn: '30d' }
        );
        res.cookie('auth', token);
        return res.status(200).json({
            message: 'login successful',
            client: { id: client._id, name: client.name, lastname: client.lastname, email: client.email, picture: client.picture }
        });
    }),
    logout: catchAsync(async (req, res) => {
        res.clearCookie('auth');
        return res.status(200).json({ message: 'logout successful' });
    }),
    requestRecoveryCode: catchAsync(async (req, res) => {
        const { email } = req.body;
        const found = await model.findOne({ email });
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
        res.cookie('c_recovery', token, { maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: 'recovery email sent' });
    }),
    verifyRecoveryCode: catchAsync(async (req, res) => {
        const { code } = req.body;
        const token = req.cookies.c_recovery;
        if (!token) throw new AuthenticationError('session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (code !== decoded.code) throw new AuthorizationError('incorrect code');
        const newToken = jsonwebtoken.sign(
            { email: decoded.email, verified_email: true },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        res.cookie('c_recovery', newToken, { maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: 'code verified successfully. You can now change your password' });
    }),
    resetPassword: catchAsync(async (req, res) => {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return res.status(400).json({ message: 'passwords do not match' });
        const token = req.cookies.c_recovery;
        if (!token) throw new AuthenticationError('session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (!decoded.verified_email) throw new AuthorizationError('account not verified');
        const hash = await bcrypt.hash(newPassword, 10);
        const client = await model.findOneAndUpdate(
            { email: decoded.email },
            { password: hash },
            { new: true }
        );
        if (!client) throw new NotFoundError('client not found');
        res.clearCookie('c_recovery');
        return res.status(200).json({ message: 'password changed successfully' });
    }),
    uploadPicture: catchAsync(async (req, res) => {
        if (!req.file) throw new NotFoundError('image not found');
        const client = await model.findById(req.user.id);
        if (!client) throw new NotFoundError('client not found');
        if (client.picture_id) await cloudinary.uploader.destroy(client.picture_id);
        client.picture = req.file.path;
        client.picture_id = req.file.filename;
        await client.save();
        return res.status(200).json({ message: 'picture updated successfully', client });
    }),
    put: catchAsync(async (req, res) => {
        const client = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!client) throw new NotFoundError('client not found');
        return res.status(200).json({ message: 'client updated successfully', client });
    }),
    delete: catchAsync(async (req, res) => {
        const client = await model.findByIdAndDelete(req.params.id);
        if (!client) throw new NotFoundError('client not found');
        return res.status(200).json({ message: 'client deleted successfully' });
    })
};
export default controller;