import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../../config.js';
import adminModel from '../../models/admin.js';
import clientModel from '../../models/client.js';
import collaboratorModel from '../../models/collaborator.js';
import { AUTH_COOKIE_NAMES } from '../../utils/auth_cookie.js';

const modelsByRole = {
	admin: adminModel,
	client: clientModel,
	collaborator: collaboratorModel,
};

// Junta los tokens candidatos disponibles: el header Authorization (si lo
// mandan) y las cookies por rol -auth_admin/auth_client/auth_collaborator,
// ver utils/auth_cookie.js-. Antes había una sola cookie "auth" compartida
// entre los tres roles, así que iniciar sesión en una pestaña como admin
// pisaba silenciosamente la sesión de colaborador que estaba activa en otra.
// Con una cookie por rol, las tres pueden convivir en el mismo navegador.
//
// OJO: si de verdad hay sesiones válidas de más de un rol al mismo tiempo
// (ej. admin y colaborador en dos pestañas), las cookies de ambas viajan
// juntas en cada petición sin importar desde qué pestaña salió -eso ya es
// una limitación de las cookies, no de esta app-, así que en ese caso puntual
// siempre se usa la primera que decodifique bien, en el orden de abajo.
const getTokenCandidates = (req) => {
	const candidates = [];
	const bearer = req.headers.authorization?.split(' ')[1];
	if (bearer) candidates.push(bearer);
	for (const cookieName of Object.values(AUTH_COOKIE_NAMES)) {
		if (req.cookies?.[cookieName]) candidates.push(req.cookies[cookieName]);
	}
	return candidates;
};

// Verifica que la petición incluya un token válido (cookie por rol o header Authorization).
export const requireAuth = async (req, res, next) => {
	const candidates = getTokenCandidates(req);
	if (candidates.length === 0) return res.status(401).json({ message: 'se requiere autenticación' });

	let decoded = null;
	for (const token of candidates) {
		try {
			decoded = jsonwebtoken.verify(token, config.jwt.secret);
			break;
		} catch {
			// token inválido/expirado: se intenta con el siguiente candidato
		}
	}
	if (!decoded) return res.status(401).json({ message: 'la sesión es inválida o ha expirado' });

	try {
		// Si el token trae número de sesión (v), se compara contra el que
		// tiene el usuario ahora en la base de datos: si no coincide, es un
		// token de una sesión que ya fue cerrada remotamente (logout-all),
		// aunque el JWT en sí todavía no haya expirado.
		if (decoded.v !== undefined) {
			const Model = modelsByRole[decoded.role];
			const user = Model && await Model.findById(decoded.id).select('session_version');
			if (!user || user.session_version !== decoded.v) {
				return res.status(401).json({ message: 'la sesión fue cerrada desde otro dispositivo, inicie sesión de nuevo' });
			}
		}

		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'la sesión es inválida o ha expirado' });
	}
};
