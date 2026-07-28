// Solo pueden acceder a una cita las personas involucradas en ella. El administrador, el cliente que la solicitó o el colaborador asignado.
export const requireAppointmentAccess = async (req, res, next) => {
    try {
        // Obtiene la cita para verificar quién tiene permiso de acceso
        const appointment = await service.getById(req.params.id);

        // Cualquier admin puede ver las citas jejeje
        const isAdmin = req.user.role === 'admin';

        // Verifica que el cliente autenticado sea quien solicitó la cita
        const isBuyer = req.user.role === 'client'
            && String(appointment.buyer._id ?? appointment.buyer) === req.user.id;

        // Verifica que el colaborador autenticado sea el asignado a la cita
        const isAssignedCollaborator = req.user.role === 'collaborator'
            && appointment.collaborator
            && String(appointment.collaborator._id ?? appointment.collaborator) === req.user.id;

        // Solo los usuarios con relación directa a la cita pueden continuar
        if (!isAdmin && !isBuyer && !isAssignedCollaborator) {
            return res.status(403).json({
                message: 'you do not have access to this appointment'
            });
        }

        // Guarda la cita para reutilizarla más adelante si es necesario y evitar volver a consultarla
        req.appointment = appointment;

        next();
    } catch (err) {
        next(err);
    }
};