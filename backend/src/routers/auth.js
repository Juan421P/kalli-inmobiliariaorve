import express from 'express';
import c from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
const auth = express.Router();
auth.route('/me').get(requireAuth, c.me);
export default auth;