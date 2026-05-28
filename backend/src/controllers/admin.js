import jsonwebtoken from 'jsonwebtoken';
import model from '../models/admin.js';
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
        const admins = await model.find();
        return res.status(200).json({ admins });
    }),
    getById: catchAsync(async (req, res) => {
        const admin = await model.findById(req.params.id);
        if (!admin) throw new NotFoundError('admin not found');
        return res.status(200).json({ admin });
    }),
    post: catchAsync(async (req, res) => {
        const exists = await model.findOne({ email: req.body.email });
        if (exists) throw new ConflictError('admin already exists');
        if (!req.file) throw new NotFoundError('image not found');
        const data = { ...req.body };
        data.picture = req.file.path;
        data.picture_id = req.file.filename;
        data.verified_email = false;
        delete data.password;
        const admin = new model(data);
        await admin.save();
        const code = crypto.randomBytes(3).toString('hex');
        const token = jsonwebtoken.sign(
            { id: admin._id, code },
            config.jwt.secret,
            { expiresIn: '15m' }
        );
        await Mail.sendHtml(
            admin.email,
            'Completar cuenta',
            `Dispone usted de 15 minutos para activar su cuenta con este código: ${code}`,
            registration(code)
        );
        return res.status(201).json({ message: 'invitation sent successfully', admin });
    }),
    completeInvitation: catchAsync(async (req, res) => {
        const { token, code, password, confirmPassword } = req.body;
        if (password !== confirmPassword) return res.status(400).json({ message: 'passwords do not match' });
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (decoded.code !== code) throw new AuthorizationError('incorrect code');
        const admin = await model.findById(decoded.id);
        if (!admin) throw new NotFoundError('admin not found');
        admin.password = await bcrypt.hash(password, 10);
        admin.verified_email = true;
        await admin.save();
        return res.status(200).json({ message: 'account completed successfully' });
    }),
    login: catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const admin = await model.findOne({ email }).select('+password');
        if (!admin) throw new AuthorizationError('invalid credentials');
        if (!admin.verified_email) throw new AuthorizationError('email not verified');
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) throw new AuthorizationError('invalid credentials');
        const token = jsonwebtoken.sign(
            { id: admin._id },
            config.jwt.secret,
            { expiresIn: '30d' }
        );
        res.cookie('auth', token);
        return res.status(200).json({
            message: 'login successful',
            admin: { id: admin._id, name: admin.name, lastname: admin.lastname, email: admin.email, picture: admin.picture }
        });
    }),
    logout: catchAsync(async (req, res) => {
        res.clearCookie('auth');
        return res.status(200).json({ message: 'logout successful' });
    }),
    uploadPicture: catchAsync(async (req, res) => {
        if (!req.file) throw new NotFoundError('image not found');
        const admin = await model.findById(req.params.id);
        if (!admin) throw new NotFoundError('admin not found');
        if (admin.picture_id) await cloudinary.uploader.destroy(admin.picture_id);
        admin.picture = req.file.path;
        admin.picture_id = req.file.filename;
        await admin.save();
        return res.status(200).json({ message: 'picture updated successfully', admin });
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
    changePassword: catchAsync(async (req, res) => {
        const { newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return res.status(400).json({ message: 'passwords do not match' });
        const token = req.cookies.a_recovery;
        if (!token) throw new AuthenticationError('session expired');
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        if (!decoded.verified_email) throw new AuthorizationError('account not verified');
        const hash = await bcrypt.hash(newPassword, 10);
        const admin = await model.findOneAndUpdate(
            { email: decoded.email },
            { password: hash },
            { new: true }
        );
        if (!admin) throw new NotFoundError('admin not found');
        res.clearCookie('a_recovery');
        return res.status(200).json({ message: 'password changed successfully' });
    }),
    put: catchAsync(async (req, res) => {
        const admin = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!admin) throw new NotFoundError('admin not found');
        return res.status(200).json({ message: 'admin updated successfully', admin });
    }),
    delete: catchAsync(async (req, res) => {
        const admin = await model.findByIdAndDelete(req.params.id);
        if (!admin) throw new NotFoundError('admin not found');
        return res.status(200).json({ message: 'admin deleted successfully' });
    })
};
export default controller;