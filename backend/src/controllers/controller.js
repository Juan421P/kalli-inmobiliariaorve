import { catchAsync } from '../utils/catch_async.js';
import HttpResponses from '../utils/http_responses.js';

class Controller {
    constructor(name) {
        this.name = name;
        this.get = catchAsync(this.get.bind(this));
        this.getById = catchAsync(this.getById.bind(this));
        this.post = catchAsync(this.post.bind(this));
        this.put = catchAsync(this.put.bind(this));
        this.delete = catchAsync(this.delete.bind(this));
        this.search = catchAsync(this.search.bind(this));
    }
    async get(req, res) {
        const { page, limit, sort } = req.query;
        const result = await this.service.findAll({ page, limit, sort }, {});
        return HttpResponses.ok(res, result, `data from ${this.name} retrieved successfully`);
    }
    async search(req, res) {
        const { page, limit, sort } = req.query;
        const filter = req.body;
        const result = await this.service.findAll({ page, limit, sort }, filter);
        return HttpResponses.ok(res, result, `search completed successfully`);
    }
    async getById(req, res) {
        const { id } = req.params;
        const item = await this.service.findById(id);
        if (!item) return HttpResponses.notFound(res, `${this.name} not found`);
        return HttpResponses.ok(res, item, `${this.name} found`);
    }
    async post(req, res) {
        const item = await this.service.create(req.body);
        return HttpResponses.created(res, item, `${this.name} saved successfully`);
    }
    async put(req, res) {
        const { id } = req.params;
        const item = await this.service.update(id, req.body);
        if (!item) return HttpResponses.notFound(res, `${this.name} not found`);
        return HttpResponses.ok(res, item, `${this.name} updated successfully`);
    }
    async delete(req, res) {
        const { id } = req.params;
        const item = await this.service.delete(id);
        if (!item) return HttpResponses.notFound(res, `${this.name} not found`);
        return HttpResponses.ok(res, null, `${this.name} deleted successfully`);
    }
}
export default Controller;