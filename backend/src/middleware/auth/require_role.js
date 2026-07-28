// Súper obvio igual
export const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({ message: `requires one of the following roles: ${roles.join(', ')}` });
    }
    next();
};