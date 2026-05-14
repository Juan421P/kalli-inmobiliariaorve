import HttpResponses from '../../utils/http_responses.js';
export const requireAdminOrSelf = (req, res, next) => {
    if (!req.user) return HttpResponses.serverError(res, 'auth middleware missing before role check');
    const isSelf = req.user.id === req.params.id;
    const isAdmin = req.user.role === 'admin';
    if (isSelf || isAdmin) return next();
    return HttpResponses.forbidden(res, 'access denied');
};