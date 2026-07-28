import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../../config.js';

// Verifica que la petición incluya un token válido. Acepta tanto cookies (flujo principal) como el header Authorization, lo que facilita pruebas o integraciones externas o no sé algo así me dijo el gpt
export const requireAuth = (req, res, next) => {
	// Intenta obtener el token desde la cookie o el header Authorization
	const token = req.cookies?.auth || req.headers.authorization?.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'authentication required' });
	try {
		// Valida el token y guarda la información del usuario autenticado para que los siguientes middlewares o controladores puedan usarla (IMPORTANTEEEE)
		const decoded = jsonwebtoken.verify(token, config.jwt.secret);
		req.user = decoded;
		next();
	} catch (err) {
		// El token es inválido, fue modificado o ya expiró. Carita triste :'v
		return res.status(401).json({ message: 'invalid or expired session' });
	}
};