import express from 'express';
import controller from '../controllers/admin.js';
import cloudinary from '../utils/cloudinary.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireRole } from '../middleware/auth/require_role.js';
import { requireSelf } from '../middleware/auth/require_self.js';
import { validatePayload } from '../middleware/validate_payload.js';
import { parseMultipartJSON } from '../middleware/parse_multipart_json.js';
import { injectUploadedFile } from '../middleware/inject_uploaded_file.js';
import { schemas } from '../schemas/admin.js';

const admin = express.Router();

admin.route('/')
    .get(
        requireAuth,
        requireRole('admin'),
        controller.get
    );

admin.route('/invite')
    .post(
        requireAuth,
        requireRole('admin'),
        cloudinary.single('picture'),
        injectUploadedFile,
        parseMultipartJSON,
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
        requireRole('admin'),
        validatePayload({ params: schemas.queryById }),
        controller.getById
    )
    .put(
        requireAuth,
        requireRole('admin'),
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

admin.route('/:id/image')
    .put(
        requireAuth,
        requireRole('admin'),
        requireSelf,
        cloudinary.single('picture'),
        validatePayload({ params: schemas.queryById, body: schemas.uploadPicture }),
        controller.uploadPicture
    );

export default admin;