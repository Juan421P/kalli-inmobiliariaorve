import Admin from '../../models/admin.js';
import Collaborator from '../../models/collaborator.js';

export const requireStaff = async (req, res, next) => {
	if (!req.user) return res.status(500).json({ message: 'auth middleware missing before role check' });
	try {
		if (await Admin.exists({ _id: req.user.id })) return next();
		if (await Collaborator.exists({ _id: req.user.id })) return next();
		return res.status(403).json({ message: 'access denied' });
	} catch {
		return res.status(500).json({ message: 'internal server error' });
	}
};
