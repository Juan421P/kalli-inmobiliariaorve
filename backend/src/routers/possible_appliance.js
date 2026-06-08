import express from 'express';
import c from '../controllers/possible_appliance.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
const possibleAppliance = express.Router();

possibleAppliance
    .route('/')
    .get(c.get)
    .post(c.post);

possibleAppliance
    .route('/:id')
    .put(c.put)
    .delete(c.delete);

export default possibleAppliance;
 