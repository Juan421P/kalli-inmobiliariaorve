import service from '../services/client.js';
import { authCookie } from '../utils/auth_cookie.js';
import { catchAsync } from '../utils/catch_async.js';
import ValidationError from '../errors/validation.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const clients = await service.getAll();
        return res.status(200).json({ clients });
    }),

    getById: catchAsync(async (req, res) => {
        const client = await service.getById(req.params.id);
        return res.status(200).json({ client });
    }),

    register: catchAsync(async (req, res) => {
        await service.register(req.body);
        return res.status(201).json({ message: 'verification code sent to email' });
    }),

    verifyEmail: catchAsync(async (req, res) => {
        const { token, client } = await service.verifyEmail(req.body);
        authCookie.set(res, token);
        return res.status(200).json({ message: 'registration completed successfully, logging in', client });
    }),

    put: catchAsync(async (req, res) => {
        await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'profile updated successful' });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'client deleted successfully' });
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
        await service.requestRecoveryCode(req.body);
        return res.status(200).json({ message: 'recovery code sent to email' });
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
        const { token, client } = await service.login({ email, password });
        authCookie.set(res, token);
        return res.status(200).json({ message: 'login successful', client });
    }),

    logout: catchAsync(async (req, res) => {
        await service.logout();
        authCookie.clear(res);
        return res.status(200).json({ message: 'logout successful' });
    })

};
export default controller;