import Router from './router.js';
import Controller from '../controllers/offer.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { validate } from '../middleware/validate.js';
import { create, counter, resolve } from '../schemas/offer.js';
import { requireStaff } from '../middleware/auth/require_staff.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
class OfferRouter extends Router {
    constructor() {
        super({
            disabledRoutes: ['put'],
            routeMiddleware: {
                get: [requireAuth, requireStaff],
                getById: [requireAuth],
                post: [requireAuth, validate(create)],
                delete: [requireAuth, requireAdmin]
            }
        });
        this.controller = Controller;
        this._init();
    }
    initializeCustomRoutes() {
        this.router.post('/:id/counter', requireAuth, validate(counter), this.controller.counter);
        this.router.patch('/:id/resolve', requireAuth, validate(resolve), this.controller.resolve);
    }
}
export default new OfferRouter().getRouter();