export const requireAdmin = (req, res, next) => {
    if (!req.user) return res.status(500).json({ message: 'auth middleware missing before role check' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'access denied' });
    next();
};