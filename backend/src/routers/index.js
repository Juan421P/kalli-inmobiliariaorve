import { Router } from 'express';
import admin from './admin.js';
import client from './client.js';
import collaborator from './collaborator.js';
const AppRouter = Router();
AppRouter.use('/admin', admin);
AppRouter.use('/client', client);
AppRouter.use('/collaborator', collaborator);
export default AppRouter;