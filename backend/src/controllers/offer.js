import service from '../services/offer.js';
import { catchAsync } from '../utils/catch_async.js';

const controller = {

    get: catchAsync(async (req, res) => {
        const { offers, total, metrics } = await service.getAll(req.query);
        return res.status(200).json({ offers, total, metrics });
    }),

    getById: catchAsync(async (req, res) => {
        return res.status(200).json({ offer: req.offer });
    }),

    post: catchAsync(async (req, res) => {
        const offer = await service.create({ actor: req.user, ...req.body });
        return res.status(201).json({ message: 'offer created successfully', offer });
    }),

    counter: catchAsync(async (req, res) => {
        const offer = await service.counter(req.params.id, { actor: req.user, ...req.body });
        return res.status(200).json({ message: 'counter-offer submitted successfully', offer });
    }),

    resolve: catchAsync(async (req, res) => {
        const offer = await service.resolve(req.params.id, { actor: req.user, ...req.body });
        return res.status(200).json({ message: `offer marked as ${offer.status}`, offer });
    }),

    put: catchAsync(async (req, res) => {
        const offer = await service.update(req.params.id, { actor: req.user, ...req.body });
        return res.status(200).json({ message: 'offer updated successfully', offer });
    }),

    delete: catchAsync(async (req, res) => {
        await service.delete(req.params.id);
        return res.status(200).json({ message: 'offer deleted successfully' });
    }),
};
export default controller;