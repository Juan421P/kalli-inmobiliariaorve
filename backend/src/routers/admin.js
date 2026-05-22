import Router from './router.js';
import Controller from '../controllers/admin.js';
import cloudinary from '../utils/cloudinary.js';
import { requireAuth } from '../middleware/auth/require_auth.js';
import { requireAdmin } from '../middleware/auth/require_admin.js';
import { requireAdminOrSelf } from '../middleware/auth/require_admin_or_self.js';
import { validate } from '../middleware/validate.js';
import { changePassword, login, register, search, update } from '../schemas/admin.js';
class AdminRouter extends Router {
    constructor() {
        super({
            disabledRoutes: [],
            routeMiddleware: {
                get: [requireAuth, requireAdmin],
                search: [requireAuth, requireAdmin, validate(search)],
                post: [requireAuth, requireAdmin, cloudinary.single('picture'), validate(register)],
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
        this.router.post('/complete-invitation', this.controller.completeInvitation);
        this.router.post('/password-recovery/request', this.controller.requestRecoveryCode);
        this.router.post('/password-recovery/verify', this.controller.verifyRecoveryCode);
        this.router.post('/password-recovery/change-password', validate(changePassword), this.controller.resetPassword);
        this.router.put('/:id/image', requireAuth, requireAdmin, cloudinary.single('picture'), this.controller.uploadPicture);
        this.router.post('/logout', requireAuth, this.controller.logout);
    }
}
export default new AdminRouter().getRouter();