import model from '../models/property.js';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config.js';
import { catchAsync } from '../utils/catch_async.js';
import NotFoundError from '../errors/not_found.js';
import ValidationError from '../errors/validation.js';
import { emitPropertyCreated } from '../events/property/created.js';
import { emitPropertyViewed } from '../events/property/viewed.js';
import { emitPropertyPriceChanged } from '../events/property/price_changed.js';
import { generatePropertyId } from '../utils/property_id/generate.js';
async function resolveAddress(coordinates) {
    const response = await axios.post(`${config.app.address_api}/address`, { coordinates });
    return response.data.data;
}
const controller = {
    get: catchAsync(async (req, res) => {
        const properties = await model.find();
        return res.status(200).json({ properties });
    }),
    getById: catchAsync(async (req, res) => {
        const property = await model.findById(req.params.id);
        if (!property) throw new NotFoundError('property not found');
        return res.status(200).json({ property });
    }),
    post: catchAsync(async (req, res) => {
        const data = { ...req.body };
        const { files, user: actor, session } = req;
        if (!files || files.length < 3) throw new ValidationError('at least 3 pictures are required');
        data.pictures = files.map(file => ({ picture: file.path, picture_id: file.filename }));
        if (data.location?.coordinates) {
            const resolved = await resolveAddress(data.location.coordinates);
            data.address = resolved.formatted_address;
            data.public_id = await generatePropertyId(resolved.components, session);
        }
        const property = new model(data);
        await property.save();
        await emitPropertyCreated({ actor, property });
        return res.status(201).json({ message: 'property created successfully', property });
    }),
    put: catchAsync(async (req, res) => {
        const { id } = req.params;
        const data = { ...req.body };
        const { files, user: actor } = req;
        const remove_pictures = data.remove_pictures ? JSON.parse(data.remove_pictures) : [];
        const existing = await model.findById(id);
        if (!existing) throw new NotFoundError('property not found');
        if (data.location?.coordinates) {
            const resolved = await resolveAddress(data.location.coordinates);
            data.address = resolved.formatted_address;
        }
        const oldPrice = existing.price;
        if (data.price !== undefined && oldPrice !== data.price) data.$push = { price_history: oldPrice };
        let pictures = [...existing.pictures];
        if (remove_pictures.length) {
            for (const pic of pictures) {
                if (remove_pictures.includes(pic.picture_id)) await cloudinary.uploader.destroy(pic.picture_id);
            }
            pictures = pictures.filter(pic => !remove_pictures.includes(pic.picture_id));
        }
        if (files?.length) pictures.push(...files.map(file => ({ picture: file.path, picture_id: file.filename })));
        if (pictures.length < 3) throw new ValidationError('a property must have at least 3 pictures');
        data.pictures = pictures;
        const property = await model.findByIdAndUpdate(id, data, { new: true });
        if (data.price !== undefined && oldPrice !== property.price) await emitPropertyPriceChanged({ actor, property, old_price: oldPrice, new_price: property.price });
        return res.status(200).json({ message: 'property updated successfully', property });
    }),
    incrementViews: catchAsync(async (req, res) => {
        const property = await model.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!property) throw new NotFoundError('property not found');
        await emitPropertyViewed({ property });
        return res.status(200).json({ message: 'view counted' });
    }),
    getByPublicId: catchAsync(async (req, res) => {
        const property = await model.findOne({ public_id: req.params.public_id });
        if (!property) throw new NotFoundError('property not found');
        return res.status(200).json({ message: 'property found', property });
    }),
    delete: catchAsync(async (req, res) => {
        const property = await model.findByIdAndDelete(req.params.id);
        if (!property) throw new NotFoundError('property not found');
        return res.status(200).json({ message: 'property deleted successfully' });
    })
};
export default controller;