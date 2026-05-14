import Service from './service.js';
import model from '../models/offer.js';
class OfferService extends Service {
    constructor() {
        super();
        this.model = model;
    }
    async create(data) {
        data.last_actor = 'buyer';
        data.history = [{ price: data.price, actor: 'buyer' }];
        return await this.model.create(data);
    }
    async counter(id, newPrice, actor) {
        const offer = await this.model.findById(id);
        if (!offer) throw new Error('offer not found');
        if (['accepted', 'rejected', 'withdrawn'].includes(offer.status)) throw new Error('cannot counter a closed offer');
        if (offer.last_actor === actor) throw new Error('you must wait for the other party to respond');
        offer.price = newPrice;
        offer.status = 'countered';
        offer.last_actor = actor;
        offer.history.push({ price: newPrice, actor });
        return await offer.save();
    }
    async resolve(id, status) {
        if (!['accepted', 'rejected', 'withdrawn'].includes(status)) throw new Error('invalid resolution status');
        return await this.model.findByIdAndUpdate(id, { status }, { new: true });
    }
}
export default new OfferService();