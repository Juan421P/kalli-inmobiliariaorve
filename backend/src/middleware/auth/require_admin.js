import HttpResponses from '../../utils/http_responses.js';
export const requireAdmin = (req, res, next) => {
    if (!req.user) return HttpResponses.serverError(res, 'auth middleware missing before role check');
    if (req.user.role !== 'admin') return HttpResponses.forbidden(res, 'admin privileges required');
    next();
};