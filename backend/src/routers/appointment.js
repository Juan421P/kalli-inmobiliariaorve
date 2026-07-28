import express from 'express';
import controller from '../controllers/appointment.js';
import service from '../services/appointment.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireRole } from '../middleware/auth/require_role.js';
import { requireStaff } from '../middleware/auth/require_staff.js';
import { requireAppointmentAccess } from '../middleware/auth/require_appointment_access.js';
import { requireAssignedCollaboratorOrAdmin } from '../middleware/auth/require_assigned_collaborator_or_admin.js';
import { requireAppointmentOwnerOrStaff } from '../middleware/auth/require_appointment_owner_or_staff.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/appointment.js';

const appointment = express.Router();

const getAppointment = (req) => service.getById(req.params.id);

appointment.route('/')
    .get(
        requireAuth,
        requireStaff,
        validatePayload({ query: schemas.queryFilter }),
        controller.get
    )
    .post(
        requireAuth,
        validatePayload({ body: schemas.create }),
        controller.post
    );

appointment.route('/:id')
    .get(
        requireAuth,
        validatePayload({ params: schemas.queryById }),
        requireAppointmentAccess,
        controller.getById
    )
    .put(
        requireAuth,
        requireStaff,
        validatePayload({ params: schemas.queryById, body: schemas.update }),
        controller.put
    )
    .delete(
        requireAuth,
        requireRole('admin'),
        validatePayload({ params: schemas.queryById }),
        controller.delete
    );

appointment.route('/:id/assign')
    .put(
        requireAuth,
        requireRole('admin'),
        validatePayload({ params: schemas.queryById, body: schemas.assign }),
        controller.assign
    );

appointment.route('/:id/schedule')
    .put(
        requireAuth,
        requireStaff,
        validatePayload({ params: schemas.queryById, body: schemas.schedule }),
        requireAssignedCollaboratorOrAdmin(getAppointment),
        controller.schedule
    );

appointment.route('/:id/complete')
    .put(
        requireAuth,
        requireStaff,
        validatePayload({ params: schemas.queryById }),
        requireAssignedCollaboratorOrAdmin(getAppointment),
        controller.complete
    );

appointment.route('/:id/cancel')
    .put(
        requireAuth,
        validatePayload({ params: schemas.queryById }),
        requireAppointmentOwnerOrStaff,
        controller.cancel
    );

export default appointment;