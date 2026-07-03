import model from '../models/possible_appliance.js';
import { catchAsync } from '../utils/catch_async.js';
import ConflictError from '../errors/conflict.js';
import NotFoundError from '../errors/not_found.js';

const controller = {
    get: catchAsync(async (req, res) => {
        const appliances = await model.find();
        return res.status(200).json({ appliances });
    }),

    post: catchAsync(async (req, res) => {
        const { name } = req.body;
        const trimmed = name?.trim();
        if (!trimmed)             return res.status(400).json({ message: 'El nombre es requerido.' });
        if (trimmed.length < 3)  return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres.' });
        if (trimmed.length > 60) return res.status(400).json({ message: 'El nombre no puede superar los 60 caracteres.' });

        const exists = await model.findOne({ name: trimmed });
        if (exists) throw new ConflictError('El electrodoméstico ya está registrado.');

        const appliance = new model({ name: trimmed });
        await appliance.save();

        return res.status(201).json({ message: 'Electrodoméstico creado correctamente.', appliance });
    }),

    put: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (name !== undefined && !name?.trim()) return res.status(400).json({ message: 'El nombre no puede estar vacío.' });

        const appliance = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!appliance) throw new NotFoundError('Electrodoméstico no encontrado.');

        return res.status(200).json({ message: 'Electrodoméstico actualizado correctamente.', appliance });
    }),

    delete: catchAsync(async (req, res) => {
        const appliance = await model.findByIdAndDelete(req.params.id);
        if (!appliance) throw new NotFoundError('Electrodoméstico no encontrado.');

        return res.status(200).json({ message: 'Electrodoméstico eliminado correctamente.' });
    }),

    merge: catchAsync(async (req, res) => {
        const { principal, references } = req.body;
        if (!principal || !Array.isArray(references) || references.length === 0) {
            return res.status(400).json({ message: 'El principal y las referencias son requeridos.' });
        }
        await model.deleteMany({ _id: { $in: references } });
        const appliances = await model.find();
        return res.status(200).json({ appliances });
    }),
};
export default controller;
