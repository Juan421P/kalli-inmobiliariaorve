import Controller from './controller.js';
import Service from '../services/auth.js';
import HttpResponses from '../utils/http_responses.js';
import { catchAsync } from '../utils/catch_async.js';
class AuthController extends Controller {
    constructor() {
        super('');
        this.service = Service;
        this.me = catchAsync(this.me.bind(this));
    }
    async me(req, res) {
        const session = await this.service.me(req.user);
        return HttpResponses.ok(res, session, 'authenticated');
    }
}
export default new AuthController();