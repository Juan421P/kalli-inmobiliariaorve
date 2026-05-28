import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../../config.js';
export const requireAuth = (req, res, next) => {
	const token = req.cookies?.auth || req.headers.authorization?.split(' ')[1];
	if (!token) return res.status(401).json({ message: 'authentication required' });
	try {
		const decoded = jsonwebtoken.verify(token, config.jwt.secret);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'invalid or expired session' });
	}
};