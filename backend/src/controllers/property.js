import Controller from './controller.js';
import Service from '../services/property.js';
import HttpResponses from '../utils/http_responses.js';
import { catchAsync } from '../utils/catch_async.js';
class PropertyController extends Controller {
    constructor() {
        super('property');
        this.service = Service;
        this.post = catchAsync(this.post.bind(this));
        this.put = catchAsync(this.put.bind(this));
        this.incrementViews = catchAsync(this.incrementViews.bind(this));
        this.getByPublicId = catchAsync(this.getByPublicId.bind(this));
    }
    async post(req, res) {
        const property = await this.service.create(
            req.body,
            { actor: req.user, session: req.session, files: req.files }
        );
        return HttpResponses.created(res, property, 'property created successfully');
    }
    async put(req, res) {
        const { id } = req.params;
        const remove_pictures = req.body.remove_pictures
            ? JSON.parse(req.body.remove_pictures)
            : [];
        const property = await this.service.update(
            id,
            req.body,
            { actor: req.user, files: req.files, remove_pictures }
        );
        return HttpResponses.ok(res, property, 'property updated successfully');
    }
    async incrementViews(req, res) {
        const { id } = req.params;
        await this.service.incrementViews(id);
        return HttpResponses.ok(res, null, 'view counted');
    }
    async getByPublicId(req, res) {
        const { public_id } = req.params;
        const property = await this.service.findByPublicId(public_id);
        return HttpResponses.ok(res, property, 'property found');
    }
}
export default new PropertyController();