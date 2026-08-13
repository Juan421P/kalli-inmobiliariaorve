import jsonwebtoken from 'jsonwebtoken';
import service from '../services/admin.js';
import { authCookie } from '../utils/auth_cookie.js';
import { catchAsync } from '../utils/catch_async.js';
import ValidationError from '../errors/validation.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const admins = await service.getAll();
        return res.status(200).json({ admins });
    }),

    getById: catchAsync(async (req, res) => {
        const admin = await service.getById(req.params.id);
        return res.status(200).json({ admin });
    }),

    invite: catchAsync(async (req, res) => {
        await service.invite(req.body);
        return res.status(201).json({ message: 'invitation sent successfully' });
    }),

    completeInvitation: catchAsync(async (req, res) => {
        const { token, admin } = await service.completeInvitation(req.body);
        authCookie.set(res, token);
        return res.status(200).json({ message: 'registration completed successfully, logging in', admin });
    }),

    put: catchAsync(async (req, res) => {
        await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'profile updated successful' });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'admin deleted successfully' });
    }),

    uploadPicture: catchAsync(async (req, res) => {
        if (!req.file) throw new ValidationError(
            'picture is required',
            { code: 'PICTURE_REQUIRED', field: 'picture' }
        );
        await service.uploadPicture(
            req.params.id, { picture: req.file.path, picture_id: req.file.filename }
        );
        return res.status(200).json({ message: 'profile picture updated successfully' });
    }),

    requestRecoveryCode: catchAsync(async (req, res) => {
        const { token, expiresIn } = await service.requestRecoveryCode(req.body);
        return res.status(200).json({
            message: 'recovery code sent to email',
            token,
            expiresIn
        });
    }),

    verifyRecoveryCode: catchAsync(async (req, res) => {
        const { token, expiresIn } = await service.verifyRecoveryCode(req.body);
        return res.status(200).json({
            message: 'recovery code verified successfully',
            token,
            expiresIn
        });
    }),

    changePassword: catchAsync(async (req, res) => {
        const result = await service.changePassword(req.body);
        return res.status(200).json({ ...result });
    }),

    login: catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const { token, admin } = await service.login({ email, password });
        authCookie.set(res, token);
        return res.status(200).json({ message: 'login successful', admin });
    }),

    logout: catchAsync(async (req, res) => {
        await service.logout();
        authCookie.clear(res);
        return res.status(200).json({ message: 'logout successful' });
    })

};
export default controller;