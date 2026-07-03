import express from 'express';
import c from '../controllers/schedule_availability.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';

const scheduleAvailability = express.Router();

// GET es público para que el frontend público pueda mostrar horarios disponibles al cliente
scheduleAvailability
    .route('/')
    .get(c.get)
    .post(requireAuth, requireAdmin, c.post);

scheduleAvailability
    .route('/:id')
    .get(c.getById)
    .put(requireAuth, requireAdmin, c.put)
    .delete(requireAuth, requireAdmin, c.delete);

export default scheduleAvailability;
