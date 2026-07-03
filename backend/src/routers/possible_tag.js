import express from 'express';
import c from '../controllers/possible_tag.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
const possibleTag = express.Router();

possibleTag
    .route('/')
    .get(requireAuth, c.get)
    .post(requireAuth, requireAdmin, c.post);
possibleTag
    .route('/merge')
    .post(requireAuth, requireAdmin, c.merge);
possibleTag
    .route('/:id')
    .put(requireAuth, requireAdmin, c.put)
    .delete(requireAuth, requireAdmin, c.delete);

export default possibleTag;
 