import model from '../models/possible_features.js';
import { catchAsync } from '../utils/catch_async.js';
import ConflictError from '../errors/conflict.js';
import NotFoundError from '../errors/not_found.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const features = await model.find();
        return res.status(200).json({ features });
    }),

    post: catchAsync(async (req, res) => {
        const { name } = req.body;
        const trimmed = name?.trim();
        if (!trimmed)             return res.status(400).json({ message: 'El nombre es requerido.' });
        if (trimmed.length < 3)  return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres.' });
        if (trimmed.length > 60) return res.status(400).json({ message: 'El nombre no puede superar los 60 caracteres.' });

        const exists = await model.findOne({ name: trimmed });
        if (exists) throw new ConflictError('La característica ya está registrada.');

        const feature = new model({ name: trimmed });
        await feature.save();
        return res.status(201).json({ message: 'Característica creada correctamente.', feature });
    }),

    put: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (name !== undefined && !name?.trim()) return res.status(400).json({ message: 'El nombre no puede estar vacío.' });

        const feature = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!feature) throw new NotFoundError('Característica no encontrada.');
        return res.status(200).json({ message: 'Característica actualizada correctamente.', feature });
    }),

    delete: catchAsync(async (req, res) => {
        const feature = await model.findByIdAndDelete(req.params.id);
        if (!feature) throw new NotFoundError('Característica no encontrada.');
        return res.status(200).json({ message: 'Característica eliminada correctamente.' });
    }),

    merge: catchAsync(async (req, res) => {
        const { principal, references } = req.body;
        if (!principal || !Array.isArray(references) || references.length === 0) {
            return res.status(400).json({ message: 'El principal y las referencias son requeridos.' });
        }
        await model.deleteMany({ _id: { $in: references } });
        const features = await model.find();
        return res.status(200).json({ features });
    }),

};

export default controller;
