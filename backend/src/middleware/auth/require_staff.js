import HttpResponses from '../../utils/http_responses.js';
export const requireStaff = (req, res, next) => {
	if (!req.user) return HttpResponses.serverError(res, 'auth middleware missing before role check');
	if (req.user.role === 'admin' || req.user.role === 'collaborator') return next();
	return HttpResponses.forbidden(res, 'staff privileges required');
};