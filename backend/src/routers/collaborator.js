import express from 'express';
import controller from '../controllers/collaborator.js';
import cloudinary from '../utils/cloudinary.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireRole } from '../middleware/auth/require_role.js';
import { requireSelf } from '../middleware/auth/require_self.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { schemas } from '../schemas/collaborator.js';

const collaborator = express.Router();

collaborator.route('/')
    .get(
        requireAuth,
        requireRole('admin'),
        controller.get
    );

collaborator.route('/invite')
    .post(
        requireAuth,
        requireRole('admin'),
        cloudinary.single('picture'),
        validatePayload({ body: schemas.invite }),
        controller.invite
    );

collaborator.route('/complete-invitation')
    .post(
        validatePayload({ body: schemas.completeInvitation }),
        controller.completeInvitation
    );

collaborator.route('/login')
    .post(
        validatePayload({ body: schemas.login }),
        controller.login
    );

collaborator.route('/logout')
    .post(
        requireAuth,
        controller.logout
    );

collaborator.route('/password-recovery/request')
    .post(
        validatePayload({ body: schemas.requestRecoveryCode }),
        controller.requestRecoveryCode
    );

collaborator.route('/password-recovery/verify')
    .post(
        validatePayload({ body: schemas.verifyRecoveryCode }),
        controller.verifyRecoveryCode
    );

collaborator.route('/password-recovery/change-password')
    .post(
        validatePayload({ body: schemas.changePassword }),
        controller.changePassword
    );

collaborator.route('/:id')
    .get(
        requireAuth,
        requireRole('admin'),
        validatePayload({ params: schemas.queryById }),
        controller.getById
    )
    .put(
        requireAuth,
        requireRole('collaborator'),
        requireSelf,
        validatePayload({ params: schemas.queryById, body: schemas.update }),
        controller.put
    )
    .delete(
        requireAuth,
        requireRole('admin'),
        validatePayload({ params: schemas.queryById }),
        controller.delete
    );

collaborator.route('/:id/image')
    .put(
        requireAuth,
        requireRole('collaborator'),
        requireSelf,
        cloudinary.single('picture'),
        validatePayload({ params: schemas.queryById, body: schemas.uploadPicture }),
        controller.uploadPicture
    );

export default collaborator;