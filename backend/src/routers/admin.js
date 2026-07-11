import express from 'express';
import controller from '../controllers/admin.js';
import cloudinary from '../utils/cloudinary.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
import { requireSelf } from '../middleware/auth/require_self.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/admin.js';

const admin = express.Router();

admin.route('/')
    .get(
        requireAuth,
        requireAdmin,
        controller.get
    );

admin.route('/invite')
    .post(
        requireAuth,
        requireAdmin,
        cloudinary.single('picture'),
        validatePayload({ body: schemas.invite }),
        controller.invite
    );

admin.route('/complete-invitation')
    .post(
        validatePayload({ body: schemas.completeInvitation }),
        controller.completeInvitation
    );

admin.route('/login')
    .post(
        validatePayload({ body: schemas.login }),
        controller.login
    );

admin.route('/logout')
    .post(
        requireAuth,
        controller.logout
    );

admin.route('/password-recovery/request')
    .post(
        validatePayload({ body: schemas.requestRecoveryCode }),
        controller.requestRecoveryCode
    );

admin.route('/password-recovery/verify')
    .post(
        validatePayload({ body: schemas.verifyRecoveryCode }),
        controller.verifyRecoveryCode
    );

admin.route('/password-recovery/change-password')
    .post(
        validatePayload({ body: schemas.changePassword }),
        controller.changePassword
    );

admin.route('/:id')
    .get(
        requireAuth,
        requireAdmin,
        validatePayload({ params: schemas.queryById }),
        controller.getById
    )
    .put(
        requireAuth,
        requireAdmin,
        requireSelf,
        validatePayload({ params: schemas.queryById, body: schemas.update }),
        controller.put
    )
    .delete(
        requireAuth,
        requireAdmin,
        validatePayload({ params: schemas.queryById }),
        controller.delete
    );

admin.route('/:id/image')
    .put(
        requireAuth,
        requireAdmin,
        requireSelf,
        cloudinary.single('picture'),
        validatePayload({ params: schemas.queryById, body: schemas.uploadPicture }),
        controller.uploadPicture
    );

export default admin;