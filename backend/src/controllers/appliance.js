import service from '../services/appliance.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const appliances = await service.getAll();
        return res.status(200).json({ appliances });
    }),

    post: catchAsync(async (req, res) => {
        const appliance = await service.create(req.body);
        return res.status(201).json({ message: 'appliance created successfully', appliance });
    }),

    put: catchAsync(async (req, res) => {
        const appliance = await service.update(req.params.id, req.body);
        return res.status(200).json({ message: 'appliance updated successfully', appliance });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'appliance deleted successfully' });
    }),

    merge: catchAsync(async (req, res) => {
        const appliances = await service.merge(req.body);
        return res.status(200).json({ message: 'appliances merged successfully', appliances });
    }),
};
export default controller;