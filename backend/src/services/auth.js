import admin from '../models/admin.js';
import client from '../models/client.js';
import collaborator from '../models/collaborator.js';
import AuthorizationError from '../errors/authorization.js';
class AuthService {
    async me(user) {
        if (!user?.id) throw new AuthorizationError('invalid session');
        let found = await admin.findById(user.id);
        if (found) {
            return {
                role: 'admin',
                user: {
                    id: found._id,
                    name: found.name,
                    lastname: found.lastname,
                    email: found.email,
                    picture: found.picture
                }
            };
        }
        found = await collaborator.findById(user.id);
        if (found) {
            return {
                role: 'collaborator',
                user: {
                    id: found._id,
                    name: found.name,
                    lastname: found.lastname,
                    email: found.email,
                    picture: found.picture
                }
            };
        }
        found = await client.findById(user.id);
        if (found) {
            return {
                role: 'client',
                user: {
                    id: found._id,
                    name: found.name,
                    lastname: found.lastname,
                    email: found.email,
                    picture: found.picture
                }
            };
        }
        throw new AuthorizationError('invalid session');
    }
}
export default new AuthService();