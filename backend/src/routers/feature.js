import express from 'express';
import controller from '../controllers/feature.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireRole } from '../middleware/auth/require_role.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/feature.js';

const feature = express.Router();

feature.route('/')
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

feature.route('/merge')
    .post(
        requireAuth,
        requireRole('admin'),
        validatePayload({ body: schemas.merge }),
        controller.merge
    );

feature.route('/:id')
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

export default feature;