import jsonwebtoken from 'jsonwebtoken';
import service from '../services/collaborator.js';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const collaborators = await service.getAll();
        return res.status(200).json({ collaborators });
    }),

    getById: catchAsync(async (req, res) => {
        const collaborator = await service.getById(req.params.id);
        return res.status(200).json({ collaborator });
    }),

    invite: catchAsync(async (req, res) => {
        await service.invite(req.body);
        return res.status(201).json({ message: 'invitation sent successfully' });
    }),

    completeInvitation: catchAsync(async (req, res) => {
        const { token, collaborator } = await service.completeInvitation(req.body);
        res.cookie('auth', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ message: 'registration completed successfully, logging in', collaborator });
    }),

    put: catchAsync(async (req, res) => {
        await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'profile updated successful' });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'collaborator deleted successfully' });
    }),

    uploadPicture: catchAsync(async (req, res) => {
        await service.uploadPicture(req.params.id, req.body);
        return res.status(200).json({ message: 'profile picture updated successfully' });
    }),

    requestRecoveryCode: catchAsync(async (req, res) => {
        await service.requestRecoveryCode(req.body);
        return res.status(200).json({
            message: 'recovery code sent to email'
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
        const { token, collaborator } = await service.login({ email, password });
        res.cookie('auth', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({ message: 'login successful', collaborator });
    }),

    logout: catchAsync(async (req, res) => {
        await service.logout();
        res.clearCookie('auth');
        return res.status(200).json({ message: 'logout successful' });
    })

};
export default controller;