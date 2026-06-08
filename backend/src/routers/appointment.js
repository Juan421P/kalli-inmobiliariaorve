import express from 'express';
import c from '../controllers/appointment.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
import { requireStaff } from '../middleware/auth/require_staff.js';

const appointment = express.Router();

appointment
    .route('/')
    .get(requireAuth, requireStaff, c.get)
    .post(requireAuth, c.post);

appointment
    .route('/:id')
    .get(requireAuth, c.getById)
    .put(requireAuth, requireStaff, c.put)
    .delete(requireAuth, requireAdmin, c.delete);

export default appointment;
