import express from 'express';
import controller from '../controllers/client.js';
import cloudinary from '../utils/cloudinary.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
import { requireSelf } from '../middleware/auth/require_self.js';
import { requireSelfOrAdmin } from '../middleware/auth/require_self_or_admin.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/client.js';

const client = express.Router();

client.route('/')
    .get(
        requireAuth,
        requireAdmin,
        controller.get
    );

client.route('/register')
    .post(
        cloudinary.single('picture'),
        validatePayload({ body: schemas.register }),
        controller.register
    );

client.route('/verify-email')
    .post(
        validatePayload({ body: schemas.verifyEmail }),
        controller.verifyEmail
    );

client.route('/login')
    .post(
        validatePayload({ body: schemas.login }),
        controller.login
    );

client.route('/logout')
    .post(
        requireAuth,
        controller.logout
    );

client.route('/password-recovery/request')
    .post(
        validatePayload({ body: schemas.requestRecoveryCode }),
        controller.requestRecoveryCode
    );

client.route('/password-recovery/verify')
    .post(
        validatePayload({ body: schemas.verifyRecoveryCode }),
        controller.verifyRecoveryCode
    );

client.route('/password-recovery/change-password')
    .post(
        validatePayload({ body: schemas.changePassword }),
        controller.changePassword
    );

client.route('/:id')
    .get(
        requireAuth,
        requireSelfOrAdmin,
        validatePayload({ params: schemas.queryById }),
        controller.getById
    )
    .put(
        requireAuth,
        requireSelf,
        validatePayload({ params: schemas.queryById, body: schemas.update }),
        controller.put
    )
    .delete(
        requireAuth,
        requireSelfOrAdmin,
        validatePayload({ params: schemas.queryById }),
        controller.delete
    );

client.route('/:id/image')
    .put(
        requireAuth,
        requireSelf,
        cloudinary.single('picture'),
        validatePayload({ params: schemas.queryById, body: schemas.uploadPicture }),
        controller.uploadPicture
    );

export default client;