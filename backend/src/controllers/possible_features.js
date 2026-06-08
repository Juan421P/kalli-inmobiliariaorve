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
        if (!name?.trim()) return res.status(400).json({ message: 'name is required' });

        const exists = await model.findOne({ name: name.trim() });
        if (exists) throw new ConflictError('this feature already exists');

        const feature = new model({ name: name.trim() });
        await feature.save();
        return res.status(201).json({ message: 'feature created successfully', feature });
    }),

    put: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (name !== undefined && !name?.trim()) return res.status(400).json({ message: 'name cannot be empty' });

        const feature = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!feature) throw new NotFoundError('feature not found');
        return res.status(200).json({ message: 'feature updated successfully', feature });
    }),

    delete: catchAsync(async (req, res) => {
        const feature = await model.findByIdAndDelete(req.params.id);
        if (!feature) throw new NotFoundError('feature not found');
        return res.status(200).json({ message: 'feature deleted successfully' });
    })

};

export default controller;
