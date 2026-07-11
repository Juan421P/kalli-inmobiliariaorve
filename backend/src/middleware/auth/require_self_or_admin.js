export const requireSelfOrAdmin = (req, res, next) => {
    const isSelf = req.user.id === req.params.id;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ message: 'you can only access your own profile' });
    }
    next();
};