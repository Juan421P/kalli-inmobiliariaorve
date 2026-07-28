import express from 'express';
import controller from '../controllers/resolve_address.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/resolve_address.js';

const resolveAddress = express.Router();
resolveAddress.route('/')
    .post(
        requireAuth,
        validatePayload({ body: schemas.resolve }),
        controller.post
    );

export default resolveAddress;