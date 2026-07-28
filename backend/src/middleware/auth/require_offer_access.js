import service from '../../services/offer.js';
import model from '../../models/property.js';
export const requireOfferAccess = async (req, res, next) => {
    try {
        const offer = await service.getById(req.params.id);
        const isAdmin = req.user.role === 'admin';
        const isBuyer = req.user.role === 'client' && String(offer.buyer) === req.user.id;

        let isAssignedCollaborator = false;
        if (req.user.role === 'collaborator') {
            const property = await model.findById(offer.property).select('collaborator');
            isAssignedCollaborator = property?.collaborator && String(property.collaborator) === req.user.id;
        }

        if (!isAdmin && !isBuyer && !isAssignedCollaborator) {
            return res.status(403).json({ message: 'you do not have access to this offer' });
        }
        req.offer = offer;
        next();
    } catch (err) {
        next(err);
    }
};