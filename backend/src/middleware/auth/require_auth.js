import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../../config.js';
import HttpResponses from '../../utils/http_responses.js';
export const requireAuth = (req, res, next) => {
	const token = req.cookies?.auth || req.headers.authorization?.split(' ')[1];
	if (!token) return HttpResponses.unauthorized(res, 'authentication required');
	try {
		const decoded = jsonwebtoken.verify(token, config.jwt.secret);
		req.user = decoded;
		next();
	} catch (err) { return HttpResponses.unauthorized(res, 'invalid or expired session'); }
};