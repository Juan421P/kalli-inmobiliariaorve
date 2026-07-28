import service from '../../services/appointment.js';
export const requireAppointmentOwnerOrStaff = async (req, res, next) => {
    try {
        const appointment = await service.getById(req.params.id);
        const isAdmin = req.user.role === 'admin';
        const isBuyer = req.user.role === 'client' && String(appointment.buyer._id ?? appointment.buyer) === req.user.id;
        const isAssignedCollaborator = req.user.role === 'collaborator'
            && appointment.collaborator
            && String(appointment.collaborator._id ?? appointment.collaborator) === req.user.id;

        if (!isAdmin && !isBuyer && !isAssignedCollaborator) {
            return res.status(403).json({ message: 'you do not have access to this appointment' });
        }
        req.appointment = appointment;
        next();
    } catch (err) {
        next(err);
    }
};