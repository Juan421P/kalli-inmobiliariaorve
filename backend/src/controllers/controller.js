import { catchAsync } from '../utils/catch_async.js';
import HttpResponses from '../utils/http_responses.js';
/**
 * Base controller class that provides reusable CRUD operations.
 * Child controllers can extend this class and attach a service layer.
 */
class Controller {
    /**
     * Creates a controller instance.
     *
     * - .bind(this):
     * Ensures "this" inside the methods always refers to the current
     * controller instance, even when the methods are passed directly
     * to Express routes.
     *
     * - catchAsync():
     * Wraps async methods so thrown errors and rejected Promises
     * are automatically forwarded to Express error middleware.
     *
     * @param {string} name - Resource name used in response messages
     */
    constructor(name) {
        this.name = name;
        this.get = catchAsync(this.get.bind(this));
        this.getById = catchAsync(this.getById.bind(this));
        this.post = catchAsync(this.post.bind(this));
        this.put = catchAsync(this.put.bind(this));
        this.delete = catchAsync(this.delete.bind(this));
        this.search = catchAsync(this.search.bind(this));
    }
    /**
     * Retrieves paginated resource data.
     *
     * Supported query params:
     * - page
     * - limit
     * - sort
     *
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} HTTP success response with paginated data
     */
    async get(req, res) {
        const { page, limit, sort } = req.query;
        const result = await this.service.findAll({ page, limit, sort }, {}, { actor: req.user });
        return HttpResponses.ok(res, result, `data from ${this.name} retrieved successfully`);
    }
    /**
     * Searches resources using filters sent in the request body.
     *
     * Supports pagination and sorting.
     *
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} HTTP success response with filtered results
     */
    async search(req, res) {
        const { page, limit, sort } = req.query;
        const filter = req.body;
        const result = await this.service.findAll({ page, limit, sort }, filter, { actor: req.user });
        return HttpResponses.ok(res, result, `search completed successfully`);
    }
    /**
     * Retrieves a single resource by ID.
     *
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} HTTP success or not found response
     */
    async getById(req, res) {
        const { id } = req.params;
        const item = await this.service.findById(id, { actor: req.user });
        if (!item) return HttpResponses.notFound(res, `${this.name} not found`);
        return HttpResponses.ok(res, item, `${this.name} found`);
    }
    /**
     * Creates a new resource.
     *
     * Resource data is expected in req.body.
     *
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} HTTP created response
     */
    async post(req, res) {
        const item = await this.service.create(req.body, { actor: req.user });
        return HttpResponses.created(res, item, `${this.name} saved successfully`);
    }
    /**
     * Updates an existing resource by ID.
     *
     * Updated data is expected in req.body.
     *
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} HTTP success or not found response
     */
    async put(req, res) {
        const { id } = req.params;
        const item = await this.service.update(id, req.body, { actor: req.user });
        if (!item) return HttpResponses.notFound(res, `${this.name} not found`);
        return HttpResponses.ok(res, item, `${this.name} updated successfully`);
    }
    /**
     * Deletes a resource by ID.
     *
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} HTTP success or not found response
     */
    async delete(req, res) {
        const { id } = req.params;
        const item = await this.service.delete(id, { actor: req.user });
        if (!item) return HttpResponses.notFound(res, `${this.name} not found`);
        return HttpResponses.ok(res, null, `${this.name} deleted successfully`);
    }
}
export default Controller;