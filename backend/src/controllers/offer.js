import model from '../models/offer.js';
import property from '../models/property.js';
import { catchAsync } from '../utils/catch_async.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import ValidationError from '../errors/validation.js';
const controller = {
    get: catchAsync(async (req, res) => {
        const offers = await model.find();
        return res.status(200).json({ offers });
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