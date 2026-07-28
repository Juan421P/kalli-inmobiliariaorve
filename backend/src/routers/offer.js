import express from 'express';
import controller from '../controllers/offer.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireStaff } from '../middleware/auth/require_staff.js';
import { requireRole } from '../middleware/auth/require_role.js';
import { requireOfferAccess } from '../middleware/auth/require_offer_access.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/offer.js';

const offer = express.Router();

offer.route('/')
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

offer.route('/:id')
    .get(
        requireAuth,
        validatePayload({ params: schemas.queryById }),
        requireOfferAccess,
        controller.getById
    )
    .put(
        requireAuth,
        validatePayload({ params: schemas.queryById, body: schemas.update }),
        controller.put
    )
    .delete(
        requireAuth,
        requireRole('admin'),
        validatePayload({ params: schemas.queryById }),
        controller.delete
    );

offer.route('/:id/counter')
    .post(
        requireAuth,
        validatePayload({ params: schemas.queryById, body: schemas.counter }),
        controller.counter
    );

offer.route('/:id/resolve')
    .patch(
        requireAuth,
        validatePayload({ params: schemas.queryById, body: schemas.resolve }),
        controller.resolve
    );

export default offer;