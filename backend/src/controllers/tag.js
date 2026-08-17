import service from '../services/tag.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const tags = await service.getAll();
        return res.status(200).json({ tags });
    }),

    post: catchAsync(async (req, res) => {
        const tag = await service.create(req.body);
        return res.status(201).json({ message: 'tag created successfully', tag });
    }),

    put: catchAsync(async (req, res) => {
        const tag = await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'tag updated successfully', tag });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'tag deleted successfully' });
    }),

    merge: catchAsync(async (req, res) => {
        const tags = await service.merge(req.body);
        return res.status(200).json({ message: 'tags merged successfully', tags });
    }),
};
export default controller;