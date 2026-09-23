import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import model from '../models/property.js';
import clientModel from '../models/client.js';
import NotFoundError from '../errors/not_found.js';
import ValidationError from '../errors/validation.js';
import CloudinaryError from '../errors/cloudinary.js';
import { generatePropertyId } from '../utils/property_id/generate.js';

// Máximo de propiedades que se guardan en el historial de "vistas
// recientes" de un cliente (ver models/client.js -> recently_viewed).
const MAX_RECENTLY_VIEWED = 8;

// El schema ya emite las llaves en snake_case (property_type, listing_type,
// etc.) y es .strict(), así que camelCase nunca llega hasta acá. Esto solo
// filtra los undefined para que $set no tenga que interactuar con valores malformados
function toDbFields(body) {
    const data = {};
    for (const [key, value] of Object.entries(body)) {
        if (value === undefined) continue;
        data[key] = value;
    }
    return data;
}

const service = {

    // amenities/features/appliances/tags son referencias a sus catálogos
    // (ver models/property.js) — sin populate llegan como el ObjectId crudo
    // en vez del nombre, que es justo lo que se necesita mostrar en el frontend
    async getAll() {
        return await model.find()
            .populate('amenities').populate('features').populate('appliances').populate('tags')
            .lean();
    },

    async getById(id) {
        const property = await model.findById(id)
            .populate('amenities').populate('features').populate('appliances').populate('tags');
        if (!property) throw new NotFoundError(
            'propiedad no encontrada',
            { code: 'PROPERTY_NOT_FOUND', resource: 'property', id }
        );
        return property;
    },

    async getByPublicId(publicId) {
        const property = await model.findOne({ public_id: publicId.toUpperCase() })
            .populate('amenities').populate('features').populate('appliances').populate('tags');
        if (!property) throw new NotFoundError(
            'propiedad no encontrada',
            { code: 'PROPERTY_NOT_FOUND', resource: 'property', public_id: publicId }
        );
        return property;
    },

    // Búsqueda geoespacial pura contra la propia colección. No necesita la
    // API de geocodificación, solo el índice 2dsphere que ya existe.
    async getNearby({ lat, lng, radius }) {
        return await model.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: radius,
                },
            },
            status: 'available',
        }).lean();
    },

    // Filtro por región usando address_components ya guardado. Tampoco
    // requiere la API externa. Mayúsculas/acentos son irrelevantes en este caso
    // ya que el texto viene tal cual lo devuelve el geocoder, no normalizado.
    async getByRegion({ department, municipality, district }) {
        const filter = {};
        if (department) filter['address_components.department'] = new RegExp(`^${department}$`, 'i');
        if (municipality) filter['address_components.municipality'] = new RegExp(`^${municipality}$`, 'i');
        if (district) filter['address_components.district'] = new RegExp(`^${district}$`, 'i');
        return await model.find(filter).lean();
    },

    async create({ actor, files, body }) {
        if (!files || files.length < 3) throw new ValidationError(
            'se requieren al menos 3 fotografías',
            { code: 'MIN_PICTURES_REQUIRED', field: 'pictures', min: 3 }
        );

        const data = toDbFields(body);
        data.pictures = files.map(file => ({ picture: file.path, picture_id: file.filename }));

        const session = await mongoose.startSession();
        try {
            let property;
            await session.withTransaction(async () => {
                data.public_id = await generatePropertyId(data.address_components, session);
                const [created] = await model.create([data], { session });
                property = created;
            });
            return property;
        } finally {
            await session.endSession();
        }
    },

    async update(id, { actor, files, body }) {
        const existing = await model.findById(id);
        if (!existing) throw new NotFoundError(
            'propiedad no encontrada',
            { code: 'PROPERTY_NOT_FOUND', resource: 'property', id }
        );

        const { remove_pictures: removePictures = [], ...rest } = body;
        const set = toDbFields(rest);

        const oldPrice = existing.price;
        const priceChanged = set.price !== undefined && set.price !== oldPrice;

        let pictures = [...existing.pictures];
        if (removePictures.length) {
            const toRemove = pictures.filter(pic => removePictures.includes(pic.picture_id));
            try {
                await Promise.all(toRemove.map(pic => cloudinary.uploader.destroy(pic.picture_id)));
            } catch (err) {
                throw new CloudinaryError(
                    'no se pudo eliminar una o más fotografías',
                    { property_id: id }
                );
            }
            pictures = pictures.filter(pic => !removePictures.includes(pic.picture_id));
        }
        if (files?.length) {
            pictures.push(...files.map(file => ({ picture: file.path, picture_id: file.filename })));
        }
        if (pictures.length < 3) throw new ValidationError(
            'una propiedad debe tener al menos 3 fotografías',
            { code: 'MIN_PICTURES_REQUIRED', field: 'pictures', min: 3 }
        );
        set.pictures = pictures;

        const update = { $set: set };
        if (priceChanged) update.$push = { price_history: oldPrice };

        const property = await model.findByIdAndUpdate(id, update, { new: true });

        return property;
    },

    async incrementViews(id, viewer) {
        const property = await model.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!property) throw new NotFoundError(
            'propiedad no encontrada',
            { code: 'PROPERTY_NOT_FOUND', resource: 'property', id }
        );

        // Si quien ve la propiedad está logueado como cliente, se guarda en
        // su historial para la sección "Actividad reciente" del perfil.
        // Primero se quita cualquier entrada previa de esta misma propiedad
        // y luego se agrega al frente, para que "verla otra vez" la suba al
        // tope de la lista en vez de dejar duplicados.
        if (viewer?.role === 'client') {
            await clientModel.findByIdAndUpdate(viewer.id, {
                $pull: { recently_viewed: { property: property._id } },
            });
            await clientModel.findByIdAndUpdate(viewer.id, {
                $push: {
                    recently_viewed: {
                        $each: [{ property: property._id, viewed_at: new Date() }],
                        $position: 0,
                        $slice: MAX_RECENTLY_VIEWED,
                    },
                },
            });
        }

        return property;
    },

    async delete(id) {
        const property = await model.findByIdAndDelete(id);
        if (!property) throw new NotFoundError(
            'propiedad no encontrada',
            { code: 'PROPERTY_NOT_FOUND', resource: 'property', id }
        );
        return { id, deleted: true };
    },
};

export default service;