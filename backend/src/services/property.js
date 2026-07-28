import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import model from '../models/property.js';
import NotFoundError from '../errors/not_found.js';
import ValidationError from '../errors/validation.js';
import InternalServerError from '../errors/internal_server.js';
import { emitPropertyCreated } from '../events/property/created.js';
import { emitPropertyViewed } from '../events/property/viewed.js';
import { emitPropertyPriceChanged } from '../events/property/price_changed.js';
import { generatePropertyId } from '../utils/property_id/generate.js';

function toDbFields(body) {
    const map = {
        propertyType: 'property_type',
        listingType: 'listing_type',
        parkingSpaces: 'parking_spaces',
        allowsPets: 'allows_pets',
    };
    const data = {};
    for (const [key, value] of Object.entries(body)) {
        if (value === undefined) continue;
        data[map[key] ?? key] = value;
    }
    return data;
}

const service = {

    async getAll() {
        return await model.find();
    },

    async getById(id) {
        const property = await model.findById(id);
        if (!property) throw new NotFoundError(
            'property not found', {
            code: 'PROPERTY_NOT_FOUND',
            resource: 'property',
            id
        });
        return property;
    },

    async getByPublicId(publicId) {
        const property = await model.findOne({ public_id: publicId });
        if (!property) throw new NotFoundError(
            'property not found', {
            code: 'PROPERTY_NOT_FOUND',
            resource: 'property',
            public_id: publicId
        });
        return property;
    },

    async create({ actor, files, body }) {
        if (!files || files.length < 3) throw new ValidationError(
            'at least 3 pictures are required', {
            code: 'MIN_PICTURES_REQUIRED',
            field: 'pictures',
            min: 3
        });

        const { addressComponents, ...rest } = body;
        const data = toDbFields(rest);
        data.pictures = files.map(file => ({ picture: file.path, picture_id: file.filename }));

        const session = await mongoose.startSession();
        try {
            let property;
            await session.withTransaction(async () => {
                data.public_id = await generatePropertyId(addressComponents, session);
                const [created] = await model.create([data], { session });
                property = created;
            });
            await emitPropertyCreated({ actor, property });
            return property;
        } finally {
            await session.endSession();
        }
    },

    async update(id, { actor, files, body }) {
        const existing = await model.findById(id);
        if (!existing) throw new NotFoundError(
            'property not found', {
            code: 'PROPERTY_NOT_FOUND',
            resource: 'property',
            id
        });

        const { removePictures = [], ...rest } = body;
        const set = toDbFields(rest);

        const oldPrice = existing.price;
        const priceChanged = set.price !== undefined && set.price !== oldPrice;

        let pictures = [...existing.pictures];
        if (removePictures.length) {
            const toRemove = pictures.filter(pic => removePictures.includes(pic.picture_id));
            try {
                await Promise.all(toRemove.map(pic => cloudinary.uploader.destroy(pic.picture_id)));
            } catch (err) {
                throw new InternalServerError(
                    'failed to remove one or more pictures', {
                    code: 'CLOUDINARY_DELETE_FAILED'
                });
            }
            pictures = pictures.filter(pic => !removePictures.includes(pic.picture_id));
        }
        if (files?.length) {
            pictures.push(...files.map(file => ({ picture: file.path, picture_id: file.filename })));
        }
        if (pictures.length < 3) throw new ValidationError(
            'a property must have at least 3 pictures', {
            code: 'MIN_PICTURES_REQUIRED',
            field: 'pictures',
            min: 3
        });
        set.pictures = pictures;

        const update = { $set: set };
        if (priceChanged) update.$push = { price_history: oldPrice };

        const property = await model.findByIdAndUpdate(id, update, { new: true });

        if (priceChanged) {
            await emitPropertyPriceChanged({ actor, property, old_price: oldPrice, new_price: property.price });
        }

        return property;
    },

    async incrementViews(id) {
        const property = await model.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!property) throw new NotFoundError(
            'property not found', {
            code: 'PROPERTY_NOT_FOUND',
            resource: 'property',
            id
        });
        await emitPropertyViewed({ property });
        return property;
    },

    async delete(id) {
        const property = await model.findByIdAndDelete(id);
        if (!property) throw new NotFoundError(
            'property not found', {
            code: 'PROPERTY_NOT_FOUND',
            resource: 'property',
            id
        });
        return { id, deleted: true };
    },
};
export default service;