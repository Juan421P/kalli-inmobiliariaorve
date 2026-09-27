import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../../config.js';
import { AUTH_COOKIE_NAMES } from '../../utils/auth_cookie.js';

// Igual que requireAuth, pero nunca rechaza la petición: si hay un token
// válido (cookie por rol o header Authorization), expone req.user; si no hay
// token, o ninguno es válido, simplemente sigue sin req.user. Pensado para
// rutas públicas (como ver una propiedad) que igual quieren saber "quién es"
// cuando el visitante sí tiene sesión, sin bloquear a quienes navegan sin cuenta.
const SCOPE_ROLES = { client: ['client'], staff: ['admin', 'collaborator'] };
export const optionalAuth = async (req, res, next) => {
    const candidates = [];
    const bearer = req.headers.authorization?.split(' ')[1];
    if (bearer) candidates.push(bearer);
    const scope = req.headers['x-auth-scope'];
    const roles = scope ? (SCOPE_ROLES[scope] ?? []) : Object.keys(AUTH_COOKIE_NAMES);
    for (const role of roles) {
        const cookieName = AUTH_COOKIE_NAMES[role];
        if (req.cookies?.[cookieName]) candidates.push(req.cookies[cookieName]);
    }

    for (const token of candidates) {
        try {
            req.user = jsonwebtoken.verify(token, config.jwt.secret);
            break;
        } catch {
            // token inválido o expirado: se ignora, se intenta el siguiente candidato
        }
    }
    next();
};
