import express from 'express';
import c from '../controllers/possible_amenity.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
 
const possibleAmenity = express.Router();
possibleAmenity
    .route('/')
    .get(requireAuth, c.get)
    .post(requireAuth, requireAdmin, c.post);
possibleAmenity
    .route('/:id')
    .put(requireAuth, requireAdmin, c.put)
    .delete(requireAuth, requireAdmin, c.delete);
 
export default possibleAmenity;