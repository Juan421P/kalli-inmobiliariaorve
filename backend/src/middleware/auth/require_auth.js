import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../../config.js';
import adminModel from '../../models/admin.js';
import clientModel from '../../models/client.js';
import collaboratorModel from '../../models/collaborator.js';

const modelsByRole = {
	admin: adminModel,
	client: clientModel,
	collaborator: collaboratorModel,
};

// Verifica que la petición incluya un token válido. Acepta tanto cookies (flujo principal) como el header Authorization, lo que facilita pruebas o integraciones externas o no sé algo así me dijo el gpt
export const requireAuth = async (req, res, next) => {
	// Intenta obtener el token desde la cookie o el header Authorization
	const token = req.cookies?.auth || req.headers.authorization?.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'se requiere autenticación' });
	try {
		// Valida el token y guarda la información del usuario autenticado para que los siguientes middlewares o controladores puedan usarla (IMPORTANTEEEE)
		const decoded = jsonwebtoken.verify(token, config.jwt.secret);

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
		// El token es inválido, fue modificado o ya expiró. Carita triste :'v
		return res.status(401).json({ message: 'la sesión es inválida o ha expirado' });
	}
};