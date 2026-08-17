import express from 'express';
import controller from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth/require_auth.js';

const auth = express.Router();

// Devuelve la información del usuario autenticado. Se utiliza principalmente para restaurar la sesión en el frontend.
auth.route('/me').get(
    requireAuth,
    controller.me
);

export default auth;