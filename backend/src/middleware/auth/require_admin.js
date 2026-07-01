import Admin from '../../models/admin.js';

export const requireAdmin = async (req, res, next) => {
    if (!req.user) return res.status(500).json({ message: 'auth middleware missing before role check' });
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin) return res.status(403).json({ message: 'access denied' });
        next();
    } catch {
        return res.status(500).json({ message: 'internal server error' });
    }
};