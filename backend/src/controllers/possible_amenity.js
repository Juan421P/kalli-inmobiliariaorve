import model from '../models/possible_amenity.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const amenities = await model.find();
        return res.status(200).json({ amenities });
    }),

    post: catchAsync(async (req, res) => {
        const { name } = req.body;
        const trimmed = name?.trim();
        if (!trimmed)             return res.status(400).json({ message: 'El nombre es requerido.' });
        if (trimmed.length < 3)  return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres.' });
        if (trimmed.length > 60) return res.status(400).json({ message: 'El nombre no puede superar los 60 caracteres.' });

        const exists = await model.findOne({ name: trimmed });
        if (exists) throw new ConflictError('La amenidad ya está registrada.');

        const amenity = new model({ name: trimmed });
        await amenity.save();
        return res.status(201).json({ message: 'Amenidad creada correctamente.', amenity });
    }),

    put: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (name !== undefined && !name?.trim()) return res.status(400).json({ message: 'El nombre no puede estar vacío.' });

        const amenity = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!amenity) throw new NotFoundError('Amenidad no encontrada.');
        return res.status(200).json({ message: 'Amenidad actualizada correctamente.', amenity });
    }),

    delete: catchAsync(async (req, res) => {
        const amenity = await model.findByIdAndDelete(req.params.id);
        if (!amenity) throw new NotFoundError('Amenidad no encontrada.');
        return res.status(200).json({ message: 'Amenidad eliminada correctamente.' });
    }),

    merge: catchAsync(async (req, res) => {
        const { principal, references } = req.body;
        if (!principal || !Array.isArray(references) || references.length === 0) {
            return res.status(400).json({ message: 'El principal y las referencias son requeridos.' });
        }
        await model.deleteMany({ _id: { $in: references } });
        const amenities = await model.find();
        return res.status(200).json({ amenities });
    }),

};

export default controller;
