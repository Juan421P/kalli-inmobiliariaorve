import jsonwebtoken from 'jsonwebtoken';
import model from '../models/collaborator.js';
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
        const collaborators = await model.find();
        return res.status(200).json({ collaborators });
    }),
    getById: catchAsync(async (req, res) => {
        const collaborator = await model.findById(req.params.id);
        if (!collaborator) throw new NotFoundError('collaborator not found');
        return res.status(200).json({ collaborator });
    }),
    post: catchAsync(async (req, res) => {
        const exists = await model.findOne({ email: req.body.email });
        if (exists) throw new ConflictError('collaborator already exists');
        if (!req.file) throw new NotFoundError('image not found');
        const data = { ...req.body };
        data.picture = req.file.path;
        data.picture_id = req.file.filename;
        data.verified_email = false;
        delete data.password;
        const collaborator = new model(data);
        await collaborator.save();
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
        return res.status(201).json({ message: 'invitation sent successfully', collaborator });
    }),
    completeInvitation: catchAsync(async (req, res) => {
        const { token, code, password, confirmPassword } = req.body;
        if (password !== confirmPassword) return res.status(400).json({ message: 'passwords do not match' });
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (decoded.code !== code) throw new AuthorizationError('incorrect code');
        const collaborator = await model.findById(decoded.id);
        if (!collaborator) throw new NotFoundError('collaborator not found');
        collaborator.password = await bcrypt.hash(password, 10);
        collaborator.verified_email = true;
        await collaborator.save();
        return res.status(200).json({ message: 'account completed successfully' });
    }),
    login: catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const collaborator = await model.findOne({ email }).select('+password');
        if (!collaborator) throw new AuthorizationError('invalid credentials');
        if (!collaborator.verified_email) throw new AuthorizationError('email not verified');
        const isMatch = await collaborator.comparePassword(password);
        if (!isMatch) throw new AuthorizationError('invalid credentials');
        const token = jsonwebtoken.sign(
            { id: collaborator._id },
            config.jwt.secret,
            { expiresIn: '30d' }
        );
        res.cookie('auth', token);
        return res.status(200).json({
            message: 'login successful',
            collaborator: { id: collaborator._id, name: collaborator.name, lastname: collaborator.lastname, email: collaborator.email, picture: collaborator.picture }
        });
    }),
    logout: catchAsync(async (req, res) => {
        res.clearCookie('auth');
        return res.status(200).json({ message: 'logout successful' });
    }),
    uploadPicture: catchAsync(async (req, res) => {
        if (!req.file) throw new NotFoundError('image not found');
        const collaborator = await model.findById(req.params.id);
        if (!collaborator) throw new NotFoundError('collaborator not found');
        if (collaborator.picture_id) await cloudinary.uploader.destroy(collaborator.picture_id);
        collaborator.picture = req.file.path;
        collaborator.picture_id = req.file.filename;
        await collaborator.save();
        return res.status(200).json({ message: 'picture updated successfully', collaborator });
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
        res.cookie('a_recovery', token, { maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: 'recovery email sent' });
    }),
    verifyRecoveryCode: catchAsync(async (req, res) => {
        const { code } = req.body;
        const token = req.cookies.a_recovery;
        if (!token) throw new AuthenticationError('session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (code !== decoded.code) throw new AuthorizationError('incorrect code');
        const newToken = jsonwebtoken.sign(
            { email: decoded.email, verified_email: true },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        res.cookie('a_recovery', newToken, { maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: 'code verified successfully' });
    }),
    resetPassword: catchAsync(async (req, res) => {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return res.status(400).json({ message: 'passwords do not match' });
        const token = req.cookies.a_recovery;
        if (!token) throw new AuthenticationError('session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (!decoded.verified_email) throw new AuthorizationError('account not verified');
        const hash = await bcrypt.hash(newPassword, 10);
        const collaborator = await model.findOneAndUpdate(
            { email: decoded.email },
            { password: hash },
            { new: true }
        );
        if (!collaborator) throw new NotFoundError('collaborator not found');
        res.clearCookie('a_recovery');
        return res.status(200).json({ message: 'password changed successfully' });
    }),
    put: catchAsync(async (req, res) => {
        const collaborator = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!collaborator) throw new NotFoundError('collaborator not found');
        return res.status(200).json({ message: 'collaborator updated successfully', collaborator });
    }),
    delete: catchAsync(async (req, res) => {
        const collaborator = await model.findByIdAndDelete(req.params.id);
        if (!collaborator) throw new NotFoundError('collaborator not found');
        return res.status(200).json({ message: 'collaborator deleted successfully' });
    })
};
export default controller;