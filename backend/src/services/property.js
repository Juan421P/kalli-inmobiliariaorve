import Service from './service.js';
import model from '../models/property.js';
import axios from 'axios';
import { config } from '../../config.js';
import NotFoundError from '../errors/not_found.js';
import { emitPropertyCreated } from '../events/property/created.js';
import { emitPropertyViewed } from '../events/property/viewed.js';
import { emitPropertyPriceChanged } from '../events/property/price_changed.js';
import { generatePropertyId } from '../utils/property_id/generate.js';
class PropertyService extends Service {
    constructor() {
        super();
        this.model = model;
    }
    async _resolveAddress(coordinates) {
        const response = await axios.post(`${config.app.address_api}/address`, { coordinates });
        return response.data.data;
    }
    async beforeCreate(data, context) {
        if (!data.location?.coordinates) return;
        const response = await this._resolveAddress(data.location.coordinates);
        data.address = response.formatted_address;
        data.public_id = await generatePropertyId(response.components, context.session);
    }
    async afterCreate(property, context) {
        await emitPropertyCreated({ actor: context.actor, property });
    }
    async beforeUpdate(id, data, context) {
        if (data.location?.coordinates) {
            const response = await this._resolveAddress(data.location.coordinates);
            data.address = response.formatted_address;
        }
        if (data.price) {
            const current = await this.model.findById(id);
            if (!current) throw new NotFoundError('property not found');
            if (current.price !== data.price) {
                data.$push = { price_history: current.price };
                context.original_data = { old_price: current.price };
            }
        }
    }
    async afterUpdate(property, context) {
        if (!context.original_data?.old_price || context.original_data?.old_price === property.price) return;
        await emitPropertyPriceChanged({
            actor: context.actor,
            property,
            old_price: context.original_data.old_price,
            new_price: property.price
        });
    }
    async incrementViews(id) {
        const property = await this.model.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!property) throw new NotFoundError('property not found');
        await emitPropertyViewed({ property });
        return property;
    }
    async findByPublicId(publicId) {
        const property = await this.model.findOne({ public_id: publicId });
        if (!property) throw new NotFoundError('property not found');
        return property;
    }
}
export default new PropertyService();