import Router from './router.js';
import Controller from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
class AuthRouter extends Router {
    constructor() {
        super({ disabledRoutes: ['get', 'search', 'post', 'getById', 'put', 'delete'] });
        this.controller = Controller;
        this._init();
    }
    initializeCustomRoutes() {
        this.router.get('/me', requireAuth, this.controller.me);
    }
}
export default new AuthRouter().getRouter();