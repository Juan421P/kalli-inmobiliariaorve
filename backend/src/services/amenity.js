import mongoose from 'mongoose';
import model from '../models/amenity.js';
import propertyModel from '../models/property.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';

const service = {

    async getAll() {
        return await model.find();
    },

    async create({ name }) {
        const exists = await model.findOne({ name });
        if (exists) throw new ConflictError(
            'amenity already exists', {
            code: 'AMENITY_ALREADY_EXISTS',
            field: 'name',
            value: name
        });
        return await model.create({ name });
    },

    async update(id, { name }) {
        // Solo se verifica que no se le ponga el nombre de algún otro documento
        // en la colección. Excluyendo el mismo documento jeje por eso el $ne
        // ese jeje lo escribí yo por cierto por si el ing. Bryan Miranda ve
        // este comentario en específico. "yo" siendo Juan Adolfo Portillo
        const exists = await model.findOne({ name, _id: { $ne: id } });
        if (exists) throw new ConflictError(
            'amenity already exists', {
            code: 'AMENITY_ALREADY_EXISTS',
            field: 'name',
            value: name
        });

        const amenity = await model.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );
        if (!amenity) throw new NotFoundError(
            'amenity not found', {
            code: 'AMENITY_NOT_FOUND',
            resource: 'amenity',
            id
        });
        return amenity;
    },

    async delete(id) {
        const amenity = await model.findByIdAndDelete(id);
        if (!amenity) throw new NotFoundError(
            'amenity not found', {
            code: 'AMENITY_NOT_FOUND',
            resource: 'amenity',
            id
        });
        return { id, deleted: true };
    },

    async merge({ principal, references }) {
        const principalExists = await model.exists({ _id: principal });
        if (!principalExists) throw new NotFoundError(
            'principal amenity not found', {
            code: 'AMENITY_NOT_FOUND',
            resource: 'amenity',
            id: principal
        });

        // Antes de hacer cualquier otra cosa verifica que las IDs si existan. Si
        // alguna no existe pues se informa y ya y las demás sí se mergean no sé
        // cuál sea la palabra para merge en español porque combinar suena feo
        const referenceDocs = await model.find({ _id: { $in: references } });
        if (referenceDocs.length !== references.length) {
            const foundIds = referenceDocs.map(doc => String(doc._id));
            const missing = references.filter(id => !foundIds.includes(id));
            throw new NotFoundError(
                'one or more amenities to absorb were not found', {
                code: 'AMENITY_NOT_FOUND',
                resource: 'amenity',
                missing_ids: missing
            });
        }

        // Aquí se reasignan las referencias en la colección de propiedades
        // Y también mmm se borran los documentos de las amenidades antiguas. Ajá
        // Ocurre que si una de esas dos cosas no se hace, la otra tampoco
        // debería de hacerse. Por eso van dentro de una transacción. No vaya a ser
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                const filter = { amenities: { $in: references } };

                // Se podría usar el $push aquí, pero lo que ocurre es que el
                // $addToSet como que no agrega al arreglo algo que ya existe.
                // Entonces, si, por algún motivo, la propiedad tenía las dos amenidades,
                // no pasa nada. No se duplica la referencia
                await propertyModel.updateMany(
                    filter,
                    { $addToSet: { amenities: principal } },
                    { session }
                );

                // ok aquí las IDs obsoletas pues que ya no sirven ya no representan nada
                // se eliminan y ajá eso no hay mucho más. Se quitan del arreglo de referencia
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