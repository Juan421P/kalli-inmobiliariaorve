import service from '../services/amenity.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const amenities = await service.getAll();
        return res.status(200).json({ amenities });
    }),

    post: catchAsync(async (req, res) => {
        const amenity = await service.create(req.body);
        return res.status(201).json({ message: 'amenity created successfully', amenity });
    }),

    put: catchAsync(async (req, res) => {
        const amenity = await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'amenity updated successfully', amenity });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'amenity deleted successfully' });
    }),

    merge: catchAsync(async (req, res) => {
        const amenities = await service.merge(req.body);
        return res.status(200).json({ message: 'amenities merged successfully', amenities });
    }),
};
export default controller;