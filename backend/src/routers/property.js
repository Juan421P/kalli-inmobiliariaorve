import Router from './router.js';
import Controller from '../controllers/property.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { validate } from '../middleware/validate.js';
import { propertySchema } from '../schemas/property.js';
class PropertyRouter extends Router {
    constructor() {
        super({
            routeMiddleware: {
                post: [requireAuth, validate(propertySchema)],
                put: [requireAuth, validate(propertySchema)],
                delete: [requireAuth]
            }
        });
        this.controller = Controller;
        this._init();
    }
    initializeCustomRoutes() {
        this.router.patch('/:id/view', this.controller.incrementViews);
    }
}
export default new PropertyRouter().getRouter();