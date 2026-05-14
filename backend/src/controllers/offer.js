import Controller from './controller.js';
import Service from '../services/offer.js';
import HttpResponses from '../utils/http_responses.js';
import { catchAsync } from '../utils/catch_async.js';
class OfferController extends Controller {
    constructor() {
        super('offer');
        this.service = Service;
        this.counter = catchAsync(this.counter.bind(this));
        this.resolve = catchAsync(this.resolve.bind(this));
    }
    async counter(req, res) {
        const { id } = req.params;
        const { price } = req.body;
        const actor = req.user?.type === 'client' ? 'buyer' : 'seller';
        await this.service.counter(id, price, actor);
        return HttpResponses.ok(res, null, 'counter-offer submitted successfully');
    }
    async resolve(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        await this.service.resolve(id, status);
        return HttpResponses.ok(res, null, `offer marked as ${status}`);
    }
}
export default new OfferController();