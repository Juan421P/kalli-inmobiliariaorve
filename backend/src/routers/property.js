import Router from './router.js';
import Controller from '../controllers/property.js';
import cloudinary from '../utils/cloudinary.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { validate } from '../middleware/validate.js';
import { create, update, search } from '../schemas/property.js';
class PropertyRouter extends Router {
    constructor() {
        super({
            disabledRoutes: [],
            routeMiddleware: {
                get: [validate(search)],
                post: [requireAuth, cloudinary.array('pictures', 15), validate(create)],
                put: [requireAuth, cloudinary.array('pictures', 15), validate(update)],
                delete: [requireAuth]
            }
        });
        this.controller = Controller;
        this._init();
    }
    initializeCustomRoutes() {
        this.router.get(
            '/public/:public_id',
            this.controller.getByPublicId
        );
        this.router.put(
            '/:id/view',
            this.controller.incrementViews
        );
    }
}
export default new PropertyRouter().getRouter();