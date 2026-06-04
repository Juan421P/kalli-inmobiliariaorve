import express from 'express';
import c from '../controllers/possible_features.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';

const possibleFeature = express.Router();

possibleFeature
    .route('/')
    .get(requireAuth, c.get)
    .post(requireAuth, requireAdmin, c.post);

possibleFeature
    .route('/:id')
    .put(requireAuth, requireAdmin, c.put)
    .delete(requireAuth, requireAdmin, c.delete);

export default possibleFeature;