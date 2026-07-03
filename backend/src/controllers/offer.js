import model from '../models/offer.js';
import property from '../models/property.js';
import client from '../models/client.js';
import { catchAsync } from '../utils/catch_async.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import ValidationError from '../errors/validation.js';
const controller = {
    get: catchAsync(async (req, res) => {
        const { search = '', page = 1, limit = 5, type = 'all' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter = {};

        if (search) {
            const [matchingClients, matchingProperties] = await Promise.all([
                client.find({
                    $or: [
                        { name:     { $regex: search, $options: 'i' } },
                        { lastname: { $regex: search, $options: 'i' } },
                    ],
                }).select('_id'),
                property.find({ title: { $regex: search, $options: 'i' } }).select('_id'),
            ]);
            filter.$or = [
                { buyer:    { $in: matchingClients.map((c) => c._id) } },
                { property: { $in: matchingProperties.map((p) => p._id) } },
            ];
        }

        if (type !== 'all') {
            const matchingProperties = await property.find({ listing_type: type }).select('_id');
            const ids = matchingProperties.map((p) => p._id);
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, { property: { $in: ids } }];
                delete filter.$or;
            } else {
                filter.property = { $in: ids };
            }
        }

        const [offers, total, statusCounts] = await Promise.all([
            model.find(filter)
                .populate('buyer',    'name lastname picture')
                .populate('property', 'title public_id listing_type pictures')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            model.countDocuments(filter),
            model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        ]);

        const byStatus = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
        const metrics = {
            total:     statusCounts.reduce((sum, s) => sum + s.count, 0),
            pending:   (byStatus.pending   || 0) + (byStatus.countered || 0),
            confirmed: byStatus.accepted   || 0,
            completed: (byStatus.rejected  || 0) + (byStatus.withdrawn || 0),
        };

        return res.status(200).json({ offers, total, metrics });
    }),
    getById: catchAsync(async (req, res) => {
        const offer = await model.findById(req.params.id);
        if (!offer) throw new NotFoundError('offer not found');
        return res.status(200).json({ offer });
    }),
    post: catchAsync(async (req, res) => {
        const data = { ...req.body };
        data.last_actor = 'buyer';
        data.history = [{ price: data.price, actor: 'buyer' }];
        const offer = new model(data);
        await offer.save();
        return res.status(201).json({ message: 'offer created successfully', offer });
    }),
    counter: catchAsync(async (req, res) => {
        const { id } = req.params;
        const { price } = req.body;
        const actor = req.user?.type === 'client' ? 'buyer' : 'seller';
        const offer = await model.findById(id);
        if (!offer) throw new NotFoundError('offer not found');
        if (['accepted', 'rejected', 'withdrawn'].includes(offer.status)) throw new ConflictError('cannot counter a closed offer');
        if (offer.last_actor === actor) throw new ConflictError('you must wait for the other party to respond');
        offer.price = price;
        offer.status = 'countered';
        offer.last_actor = actor;
        offer.history.push({ price, actor });
        await offer.save();
        return res.status(200).json({ message: 'counter-offer submitted successfully' });
    }),
    resolve: catchAsync(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        if (!['accepted', 'rejected', 'withdrawn'].includes(status)) throw new ValidationError('invalid resolution status');
        const session = await model.startSession();
        session.startTransaction();
        try {
            const offer = await model.findById(id).session(session);
            if (!offer) throw new NotFoundError('offer not found');
            offer.status = status;
            await offer.save({ session });
            if (status === 'accepted') {
                await property.findByIdAndUpdate(
                    offer.property,
                    { status: 'occupied' },
                    { new: true, session }
                );
            }
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
        return res.status(200).json({ message: `offer marked as ${status}` });
    }),
    put: catchAsync(async (req, res) => {
        const offer = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offer) throw new NotFoundError('offer not found');
        return res.status(200).json({ message: 'offer updated successfully', offer });
    }),
    delete: catchAsync(async (req, res) => {
        const offer = await model.findByIdAndDelete(req.params.id);
        if (!offer) throw new NotFoundError('offer not found');
        return res.status(200).json({ message: 'offer deleted successfully' });
    })
};
export default controller;