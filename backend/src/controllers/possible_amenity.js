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
        if (!name?.trim()) return res.status(400).json({ message: 'name is required' });

        const exists = await model.findOne({ name: name.trim() });
        if (exists) throw new ConflictError('amenity already exists');

        const amenity = new model({ name: name.trim() });
        await amenity.save();
        return res.status(201).json({ message: 'amenity created successfully', amenity });
    }),

    put: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (name !== undefined && !name?.trim()) return res.status(400).json({ message: 'name cannot be empty' });

        const amenity = await model.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!amenity) throw new NotFoundError('amenity not found');
        return res.status(200).json({ message: 'amenity updated successfully', amenity });
    }),

    delete: catchAsync(async (req, res) => {
        const amenity = await model.findByIdAndDelete(req.params.id);
        if (!amenity) throw new NotFoundError('amenity not found');
        return res.status(200).json({ message: 'amenity deleted successfully' });
    })

};

export default controller;
