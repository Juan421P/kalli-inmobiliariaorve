import service from '../services/property.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const properties = await service.getAll();
        return res.status(200).json({ properties });
    }),

    getById: catchAsync(async (req, res) => {
        const property = await service.getById(req.params.id);
        return res.status(200).json({ property });
    }),

    getByPublicId: catchAsync(async (req, res) => {
        const property = await service.getByPublicId(req.params.public_id);
        return res.status(200).json({ property });
    }),

    getNearby: catchAsync(async (req, res) => {
        const properties = await service.getNearby(req.query);
        return res.status(200).json({ properties });
    }),

    getByRegion: catchAsync(async (req, res) => {
        const properties = await service.getByRegion(req.query);
        return res.status(200).json({ properties });
    }),

    post: catchAsync(async (req, res) => {
        const property = await service.create({
            actor: req.user,
            files: req.files,
            body: req.body
        });
        return res.status(201).json({ message: 'property created successfully', property });
    }),

    put: catchAsync(async (req, res) => {
        const property = await service.update(req.params.id, {
            actor: req.user,
            files: req.files,
            body: req.body
        });
        return res.status(200).json({ message: 'property updated successfully', property });
    }),

    incrementViews: catchAsync(async (req, res) => {
        await service.incrementViews(req.params.id);
        return res.status(200).json({ message: 'view counted' });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'property deleted successfully' });
    }),
};
export default controller;