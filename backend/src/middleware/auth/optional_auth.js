import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../../config.js';
import { AUTH_COOKIE_NAMES } from '../../utils/auth_cookie.js';

// Igual que requireAuth, pero nunca rechaza la petición: si hay un token
// válido (cookie por rol o header Authorization), expone req.user; si no hay
// token, o ninguno es válido, simplemente sigue sin req.user. Pensado para
// rutas públicas (como ver una propiedad) que igual quieren saber "quién es"
// cuando el visitante sí tiene sesión, sin bloquear a quienes navegan sin cuenta.
export const optionalAuth = async (req, res, next) => {
    const candidates = [];
    const bearer = req.headers.authorization?.split(' ')[1];
    if (bearer) candidates.push(bearer);
    for (const cookieName of Object.values(AUTH_COOKIE_NAMES)) {
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
