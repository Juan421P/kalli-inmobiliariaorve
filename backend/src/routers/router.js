import express from 'express';
/**
 * Base router class that provides reusable CRUD route registration.
 *
 * Child routers can extend this class to define custom routes,
 * middleware, controllers, or disable specific base routes.
 */
class Router {
    /**
     * Creates a router instance.
     *
     * @param {Object} [options={}] - Router configuration options
     * @param {Array<string>} [options.disabledRoutes=[]] - List of base routes to disable
     * @param {Array<Function>} [options.routerMiddleware=[]] - Middleware applied to the entire router
     * @param {Object} [options.routeMiddleware={}] - Middleware grouped by route method
     */
    constructor(options = {}) {
        this.router = express.Router();
        this.disabledRoutes = options.disabledRoutes || [];
        this.routerMiddleware = options.routerMiddleware || [];
        this.routeMiddleware = options.routeMiddleware || {};
    }
    /**
     * Initializes router middleware and routes.
     *
     * Executes:
     * 1. Global router middleware
     * 2. Custom routes
     * 3. Default CRUD routes
     */
    _init() {
        if (this.routerMiddleware.length > 0) this.router.use(...this.routerMiddleware);

        this.initializeCustomRoutes();
        this.initializeBaseRoutes();
    }
    /**
     * Placeholder method for child classes to define custom routes.
     *
     * Intended to be overridden.
     */
    initializeCustomRoutes() { }
    /**
     * Registers default CRUD routes unless explicitly disabled.
     *
     * Supported routes:
     * - GET /
     * - POST /search
     * - POST /
     * - GET /:id
     * - PUT /:id
     * - DELETE /:id
     */
    initializeBaseRoutes() {
        const mw = (method) => this.routeMiddleware[method] || [];
        if (!this.disabledRoutes.includes('get')) this.router.get('/', ...mw('get'), this.controller.get);
        if (!this.disabledRoutes.includes('search')) this.router.post('/search', ...mw('search'), this.controller.search);
        if (!this.disabledRoutes.includes('post')) this.router.post('/', ...mw('post'), this.controller.post);
        if (!this.disabledRoutes.includes('getById')) this.router.get('/:id', ...mw('getById'), this.controller.getById);
        if (!this.disabledRoutes.includes('put')) this.router.put('/:id', ...mw('put'), this.controller.put);
        if (!this.disabledRoutes.includes('delete')) this.router.delete('/:id', ...mw('delete'), this.controller.delete);
    }
    /**
     * Returns the configured Express router instance.
     *
     * @returns {Object} Express router
     */
    getRouter() { return this.router; }
}
export default Router;