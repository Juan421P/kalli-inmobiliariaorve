import express from 'express';
import c from '../controllers/notification.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';

const notification = express.Router();

notification
    .route('/')
    .get(requireAuth, c.get)
    .post(requireAuth, requireAdmin, c.post);

notification
    .route('/:id')
    .get(requireAuth, c.getById)
    .delete(requireAuth, requireAdmin, c.delete);

notification
    .route('/:id/read')
    .patch(requireAuth, c.markRead);

export default notification;