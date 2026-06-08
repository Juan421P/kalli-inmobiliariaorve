import model from '../models/possible_tag.js';
import { catchAsync } from '../utils/catch_async.js';
import ConflictError from '../errors/conflict.js';
import NotFoundError from '../errors/not_found.js';

const controller = {
    get: catchAsync(async (req, res) => {
        const tags = await model.find();
        return res.status(200).json({ tags });
    }),

    post: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'name is required' });

        const exists = await model.findOne({ name: name.trim() });
        if (exists) throw new ConflictError('tag already exists');

        const tag = new model({ name: name.trim() });
        await tag.save();

        return res.status(201).json({ message: 'tag created successfully', tag });
    }),

    put: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (name !== undefined && !name?.trim()) return res.status(400).json({ message: 'name cannot be empty' });

        const tag = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!tag) throw new NotFoundError('tag not found');

        return res.status(200).json({ message: 'tag updated successfully', tag });
    }),

    delete: catchAsync(async (req, res) => {
        const tag = await model.findByIdAndDelete(req.params.id);
        if (!tag) throw new NotFoundError('tag not found');

        return res.status(200).json({ message: 'tag deleted successfully' });
    })
};
export default controller;
