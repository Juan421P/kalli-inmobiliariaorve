import mongoose from 'mongoose';
import model from '../models/feature.js';
import propertyModel from '../models/property.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';

// todo esto es prácticamente idéntico al de amenity.js por si quieren verlo comentado
// porque qué hueva comentarlo si es igualito que el otro allá ya está explicado
const service = {

    async getAll() {
        return await model.find();
    },

    async create({ name }) {
        const exists = await model.findOne({ name });
        if (exists) throw new ConflictError(
            'feature already exists', {
            code: 'FEATURE_ALREADY_EXISTS',
            field: 'name',
            value: name
        });
        return await model.create({ name });
    },

    async update(id, { name }) {
        const exists = await model.findOne({ name, _id: { $ne: id } });
        if (exists) throw new ConflictError(
            'feature already exists', {
            code: 'FEATURE_ALREADY_EXISTS',
            field: 'name',
            value: name
        });

        const feature = await model.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );
        if (!feature) throw new NotFoundError(
            'feature not found', {
            code: 'FEATURE_NOT_FOUND',
            resource: 'feature',
            id
        });
        return feature;
    },

    async delete(id) {
        const feature = await model.findByIdAndDelete(id);
        if (!feature) throw new NotFoundError(
            'feature not found', {
            code: 'FEATURE_NOT_FOUND',
            resource: 'feature',
            id
        });
        return { id, deleted: true };
    },

    async merge({ principal, references }) {
        const principalExists = await model.exists({ _id: principal });
        if (!principalExists) throw new NotFoundError(
            'principal feature not found', {
            code: 'FEATURE_NOT_FOUND',
            resource: 'feature',
            id: principal
        });

        const referenceDocs = await model.find({ _id: { $in: references } });
        if (referenceDocs.length !== references.length) {
            const foundIds = referenceDocs.map(doc => String(doc._id));
            const missing = references.filter(id => !foundIds.includes(id));
            throw new NotFoundError(
                'one or more amenities to absorb were not found', {
                code: 'FEATURE_NOT_FOUND',
                resource: 'feature',
                missing_ids: missing
            });
        }

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const filter = { amenities: { $in: references } };

                await propertyModel.updateMany(
                    filter,
                    { $addToSet: { amenities: principal } },
                    { session }
                );

                await propertyModel.updateMany(
                    filter,
                    { $pull: { amenities: { $in: references } } },
                    { session }
                );

                await model.deleteMany({ _id: { $in: references } }, { session });
            });
        } finally {
            await session.endSession();
        }

        return await model.find();
    },
};
export default service;