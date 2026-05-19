import Service from './service.js';
import model from '../models/property.js';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config.js';
import NotFoundError from '../errors/not_found.js';
import ValidationError from '../errors/validation.js';
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
        if (!context.files || context.files.length < 3) throw new ValidationError('at least 3 pictures are required');
        data.pictures = context.files.map(file => ({
            picture: file.path,
            picture_id: file.filename
        }));
        if (!data.location?.coordinates) return;
        const response = await this._resolveAddress(data.location.coordinates);
        data.address = response.formatted_address;
        data.public_id = await generatePropertyId(response.components, context.session);
    }
    async afterCreate(property, context) {
        await emitPropertyCreated({ actor: context.actor, property });
    }
    async beforeUpdate(id, data, context) {
        const property = await this.model.findById(id);
        if (!property) throw new NotFoundError('property not found');
        if (data.location?.coordinates) {
            const response = await this._resolveAddress(data.location.coordinates);
            data.address = response.formatted_address;
        }
        if (data.price !== undefined && property.price !== data.price) {
            data.$push = { price_history: property.price };
            context.original_data = { old_price: property.price };
        }
        let pictures = [...property.pictures];
        if (context.remove_pictures?.length) {
            for (const picture of pictures) {
                if (context.remove_pictures.includes(picture.picture_id)) await cloudinary.uploader.destroy(picture.picture_id);
            }
            pictures = pictures.filter(picture => !context.remove_pictures.includes(picture.picture_id));
        }
        if (context.files?.length) {
            pictures.push(
                ...context.files.map(file => ({
                    picture: file.path,
                    picture_id: file.filename
                }))
            );
        }
        if (pictures.length < 3) throw new ValidationError('a property must have at least 3 pictures');
        data.pictures = pictures;
    }
    async afterUpdate(property, context) {
        if (!context.original_data?.old_price) return;
        if (context.original_data.old_price === property.price) return;
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