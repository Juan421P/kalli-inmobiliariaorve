import service from '../services/feature.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const features = await service.getAll();
        return res.status(200).json({ features });
    }),

    post: catchAsync(async (req, res) => {
        const feature = await service.create(req.body);
        return res.status(201).json({ message: 'feature created successfully', feature });
    }),

    put: catchAsync(async (req, res) => {
        const feature = await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'feature updated successfully', feature });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'feature deleted successfully' });
    }),

    merge: catchAsync(async (req, res) => {
        const features = await service.merge(req.body);
        return res.status(200).json({ message: 'features merged successfully', features });
    }),
};
export default controller;