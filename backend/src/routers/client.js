import Router from './router.js';
import Controller from '../controllers/client.js';
import cloudinary from '../utils/cloudinary.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
import { requireAdminOrSelf } from '../middleware/auth/require_admin_or_self.js';
import { validate } from '../middleware/validate.js';
import { changePassword, login, register, search, update } from '../schemas/client.js';
class ClientRouter extends Router {
    constructor() {
        super({
            disabledRoutes: [],
            routeMiddleware: {
                get: [requireAuth, requireAdmin],
                search: [requireAuth, requireAdmin, validate(search)],
                post: [validate(register)],
                getById: [requireAuth, requireAdminOrSelf],
                put: [requireAuth, requireAdminOrSelf, validate(update)],
                delete: [requireAuth, requireAdmin]
            }
        });
        this.controller = Controller;
        this._init();
    }
    initializeCustomRoutes() {
        this.router.post('/login', validate(login), this.controller.login);
        this.router.post('/verify-email', this.controller.verifyEmail);
        this.router.post('/password-recovery/request', this.controller.requestRecoveryCode);
        this.router.post('/password-recovery/verify', this.controller.verifyRecoveryCode);
        this.router.post('/password-recovery/change-password', validate(changePassword), this.controller.resetPassword);
        this.router.post('/image', requireAuth, cloudinary.single('picture'), this.controller.uploadPicture);
        this.router.post('/logout', requireAuth, this.controller.logout);
    }
}
export default new ClientRouter().getRouter();