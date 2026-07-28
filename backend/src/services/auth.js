import adminModel from '../models/admin.js';
import clientModel from '../models/client.js';
import collaboratorModel from '../models/collaborator.js';
import AuthenticationError from '../errors/authentication.js';
import NotFoundError from '../errors/not_found.js';

const models = {
    admin: adminModel,
    client: clientModel,
    collaborator: collaboratorModel,
};

const service = {
    async me({ id, role }) {
        const model = models[role];
        if (!model) throw new AuthenticationError(
            'invalid session', {
            code: 'INVALID_SESSION_ROLE'
        });

        const found = await model.findById(id);
        if (!found) throw new NotFoundError(
            'user not found', {
            code: 'USER_NOT_FOUND',
            resource: role,
            id
        });

        return {
            role,
            user: {
                id: found._id,
                name: found.name,
                lastname: found.lastname,
                email: found.email,
                picture: found.picture,
            },
        };
    },
};

export default service;