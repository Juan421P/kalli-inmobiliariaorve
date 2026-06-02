import model from '../models/possible_appliance.js';
import { catchAsync } from '../utils/catch_async.js';
import ConflictError from '../errors/conflict.js';
import NotFoundError from '../errors/not_found.js';

const controller = {
    get: catchAsync(async (req, res) => {
        const appliances = await model.find();
        return res.status(200).json({ appliances });
    }),

    post: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: 'name is required' });

        const exists = await model.findOne({ name: name.trim() });
        if (exists) throw new ConflictError('appliance already exists');

        const appliance = new model({ name: name.trim() });
        await appliance.save();

        return res.status(201).json({ message: 'appliance created successfully', appliance });
    }),

    put: catchAsync(async (req, res) => {
        const { name } = req.body;
        if (name !== undefined && !name?.trim()) return res.status(400).json({ message: 'name cannot be empty' });

        const appliance = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!appliance) throw new NotFoundError('appliance not found');
        
        return res.status(200).json({ message: 'appliance updated successfully', appliance });
    }),

    delete: catchAsync(async (req, res) => {
        const appliance = await model.findByIdAndDelete(req.params.id);
        if (!appliance) throw new NotFoundError('appliance not found');
        
        return res.status(200).json({ message: 'appliance deleted successfully' });
    })
};
export default controller;
