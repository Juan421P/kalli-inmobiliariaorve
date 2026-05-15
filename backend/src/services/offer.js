import Service from './service.js';
import model from '../models/offer.js';
import property from '../models/property.js'
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import ValidationError from '../errors/validation.js';
class OfferService extends Service {
    constructor() {
        super();
        this.model = model;
    }
    async beforeCreate(data) {
        data.last_actor = 'buyer';
        data.history = [{ price: data.price, actor: 'buyer' }];
    }
    async counter(id, newPrice, actor) {
        const offer = await this.model.findById(id);
        if (!offer) throw new NotFoundError('offer not found');
        if (['accepted', 'rejected', 'withdrawn'].includes(offer.status)) throw new ConflictError('cannot counter a closed offer');
        if (offer.last_actor === actor) throw new ConflictError('you must wait for the other party to respond');
        offer.price = newPrice;
        offer.status = 'countered';
        offer.last_actor = actor;
        offer.history.push({ price: newPrice, actor });
        return await offer.save();
    }
    async resolve(id, status) {
        if (!['accepted', 'rejected', 'withdrawn'].includes(status)) throw new ValidationError('invalid resolution status');
        return await this.transaction(async (session) => {
            const offer = await this.model.findById(id).session(session);
            if (!offer) throw new NotFoundError('offer not found');
            offer.status = status;
            await offer.save({ session });
            if (status === 'accepted') {
                await property.findByIdAndUpdate(
                    offer.property,
                    { status: 'occupied' },
                    { new: true, session }
                );
            }
        });
    }
}
export default new OfferService();