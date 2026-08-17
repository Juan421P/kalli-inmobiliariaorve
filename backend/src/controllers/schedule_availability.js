import service from '../services/schedule_availability.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const schedules = await service.getAll();
        return res.status(200).json({ schedules });
    }),

    getById: catchAsync(async (req, res) => {
        const schedule = await service.getById(req.params.id);
        return res.status(200).json({ schedule });
    }),

    post: catchAsync(async (req, res) => {
        const schedule = await service.create(req.body);
        return res.status(201).json({ message: 'schedule availability created successfully', schedule });
    }),

    put: catchAsync(async (req, res) => {
        const schedule = await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'schedule availability updated successfully', schedule });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'schedule availability deleted successfully' });
    }),
};
export default controller;