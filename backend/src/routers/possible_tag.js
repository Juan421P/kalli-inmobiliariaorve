import express from 'express';
import c from '../controllers/possible_tag.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
const possibleTag = express.Router();

possibleTag
    .route('/')
    .get(c.get)
    .post(c.post);

possibleTag
    .route('/:id')
    .put(c.put)
    .delete(c.delete);

export default possibleTag;
 