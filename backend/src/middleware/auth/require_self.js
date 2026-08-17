// Se explica solito
export const requireSelf = (req, res, next) => {
    if (!req.user) return res.status(500).json({ message: 'auth middleware missing before role check' });
    if (req.user?.id === req.params.id) return next();
    return res.status(403).json({ message: 'access denied' });
};