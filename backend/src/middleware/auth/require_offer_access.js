import service from '../../services/offer.js';
import model from '../../models/property.js';
export const requireOfferAccess = async (req, res, next) => {
    try {
        const offer = await service.getById(req.params.id);
        // offer.buyer y offer.property vienen populados (service.getById los trae con
        // datos para mostrar en el detalle), así que hay que comparar contra su ._id,
        // no contra el objeto entero -String(documentoPoblado) nunca es igual al id plano-.
        const buyerId = String(offer.buyer?._id ?? offer.buyer);
        const propertyId = offer.property?._id ?? offer.property;

        const isAdmin = req.user.role === 'admin';
        const isBuyer = req.user.role === 'client' && buyerId === req.user.id;

        let isAssignedCollaborator = false;
        if (req.user.role === 'collaborator') {
            const property = await model.findById(propertyId).select('collaborator');
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