import express from 'express';
import c from '../controllers/possible_appliance.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
const possibleAppliance = express.Router();

possibleAppliance
    .route('/')
    .get(requireAuth, c.get)
    .post(requireAuth, requireAdmin, c.post);
possibleAppliance
    .route('/merge')
    .post(requireAuth, requireAdmin, c.merge);
possibleAppliance
    .route('/:id')
    .put(requireAuth, requireAdmin, c.put)
    .delete(requireAuth, requireAdmin, c.delete);

export default possibleAppliance;
 