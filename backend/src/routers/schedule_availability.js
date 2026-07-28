import express from 'express';
import controller from '../controllers/schedule_availability.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireRole } from '../middleware/auth/require_role.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/schedule_availability.js';

const scheduleAvailability = express.Router();

scheduleAvailability.route('/')
    .get(controller.get)
    .post(
        requireAuth,
        requireRole('admin'),
        validatePayload({ body: schemas.create }),
        controller.post
    );

scheduleAvailability.route('/:id')
    .get(
        validatePayload({ params: schemas.queryById }),
        controller.getById
    )
    .put(
        requireAuth,
        requireRole('admin'),
        validatePayload({ params: schemas.queryById, body: schemas.update }),
        controller.put
    )
    .delete(
        requireAuth,
        requireRole('admin'),
        validatePayload({ params: schemas.queryById }),
        controller.delete
    );

export default scheduleAvailability;