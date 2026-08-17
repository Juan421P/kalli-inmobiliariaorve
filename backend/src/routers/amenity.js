import express from 'express';
import controller from '../controllers/amenity.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireRole } from '../middleware/auth/require_role.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/amenity.js';

const amenity = express.Router();

amenity.route('/')
    .get(
        requireAuth,
        controller.get
    )
    .post(
        requireAuth,
        requireRole('admin'),
        validatePayload({ body: schemas.create }),
        controller.post
    );

amenity.route('/merge')
    .post(
        requireAuth,
        requireRole('admin'),
        validatePayload({ body: schemas.merge }),
        controller.merge
    );

amenity.route('/:id')
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

export default amenity;