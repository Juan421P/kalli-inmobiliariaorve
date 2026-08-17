import service from '../services/appointment.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const appointments = await service.getAll(filter);
        return res.status(200).json({ appointments });
    }),

    getById: catchAsync(async (req, res) => {
        const appointment = await service.getById(req.params.id);
        return res.status(200).json({ appointment });
    }),

    post: catchAsync(async (req, res) => {
        const appointment = await service.create({ actor: req.user, body: req.body });
        return res.status(201).json({ message: 'appointment created successfully', appointment });
    }),

    put: catchAsync(async (req, res) => {
        const appointment = await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'appointment updated successfully', appointment });
    }),

    assign: catchAsync(async (req, res) => {
        const appointment = await service.assign(req.params.id, req.body);
        return res.status(200).json({ message: 'collaborator assigned successfully', appointment });
    }),

    schedule: catchAsync(async (req, res) => {
        const appointment = await service.schedule(req.params.id, req.body);
        return res.status(200).json({ message: 'appointment scheduled successfully', appointment });
    }),

    complete: catchAsync(async (req, res) => {
        const appointment = await service.complete(req.params.id);
        return res.status(200).json({ message: 'appointment marked as completed', appointment });
    }),

    cancel: catchAsync(async (req, res) => {
        const appointment = await service.cancel(req.params.id);
        return res.status(200).json({ message: 'appointment cancelled', appointment });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'appointment deleted successfully' });
    }),
};
export default controller;