import service from '../services/auth.js';
import { catchAsync } from '../utils/catch_async.js';
import AuthenticationError from '../errors/authentication.js';

const controller = {
    me: catchAsync(async (req, res) => {
        if (!req.user?.id) throw new AuthenticationError(
            'invalid session', {
            code: 'INVALID_SESSION'
        });
        const { role, user } = await service.me(req.user);
        return res.status(200).json({ message: 'authenticated', role, user });
    })
};
export default controller;