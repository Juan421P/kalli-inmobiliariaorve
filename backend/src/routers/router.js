import express from 'express';
class Router {
    constructor(options = {}) {
        this.router = express.Router();
        this.disabledRoutes = options.disabledRoutes || [];
        this.routerMiddleware = options.routerMiddleware || [];
        this.routeMiddleware = options.routeMiddleware || {};
    }
    _init() {
        if (this.routerMiddleware.length > 0) this.router.use(...this.routerMiddleware);
        this.initializeCustomRoutes();
        this.initializeBaseRoutes();
    }
    initializeCustomRoutes() { }
    initializeBaseRoutes() {
        const mw = (method) => this.routeMiddleware[method] || [];
        if (!this.disabledRoutes.includes('get')) this.router.get('/', ...mw('get'), this.controller.get);
        if (!this.disabledRoutes.includes('search')) this.router.post('/search', ...mw('search'), this.controller.search);
        if (!this.disabledRoutes.includes('post')) this.router.post('/', ...mw('post'), this.controller.post);
        if (!this.disabledRoutes.includes('getById')) this.router.get('/:id', ...mw('getById'), this.controller.getById);
        if (!this.disabledRoutes.includes('put')) this.router.put('/:id', ...mw('put'), this.controller.put);
        if (!this.disabledRoutes.includes('delete')) this.router.delete('/:id', ...mw('delete'), this.controller.delete);
    }
    getRouter() { return this.router; }
}
export default Router;