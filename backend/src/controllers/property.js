import Controller from './controller.js';
import Service from '../services/property.js';
import HttpResponses from '../utils/http_responses.js';
import { catchAsync } from '../utils/catch_async.js';
class PropertyController extends Controller {
    constructor() {
        super('property');
        this.service = Service;
        this.incrementViews = catchAsync(this.incrementViews.bind(this));
    }
    async incrementViews(req, res) {
        const { id } = req.params;
        await this.service.incrementViews(id);
        return HttpResponses.ok(res, null, 'view counted');
    }
}
export default new PropertyController();