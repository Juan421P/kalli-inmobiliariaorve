import admin from '../models/admin.js';
import client from '../models/client.js';
import collaborator from '../models/collaborator.js';
import { catchAsync } from '../utils/catch_async.js';
import AuthorizationError from '../errors/authorization.js';
const controller = {
    me: catchAsync(async (req, res) => {
        if (!req.user?.id) throw new AuthorizationError('invalid session');
        let found = await admin.findById(req.user.id);
        if (found) return res.status(200).json({
            message: 'authenticated',
            role: 'admin',
            user: { id: found._id, name: found.name, lastname: found.lastname, email: found.email, picture: found.picture }
        });
        found = await collaborator.findById(req.user.id);
        if (found) return res.status(200).json({
            message: 'authenticated',
            role: 'collaborator',
            user: { id: found._id, name: found.name, lastname: found.lastname, email: found.email, picture: found.picture }
        });
        found = await client.findById(req.user.id);
        if (found) return res.status(200).json({
            message: 'authenticated',
            role: 'client',
            user: { id: found._id, name: found.name, lastname: found.lastname, email: found.email, picture: found.picture }
        });
        throw new AuthorizationError('invalid session');
    })
};
export default controller;