import model from '../models/offer.js';
import propertyModel from '../models/property.js';
import clientModel from '../models/client.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import AuthorizationError from '../errors/authorization.js';

const ACTIVE_STATUSES = ['pending', 'countered'];
const CLOSED_STATUSES = ['accepted', 'rejected', 'withdrawn'];

// em retorna el rol que tiene el usuario en la oferta. Si es el que está comprando o si es
// un colaborador o si es un full random así heavy pues retorna null porque nada que ver
async function determineSide(actor, offer) {
    if (actor.role === 'client' && String(offer.buyer) === actor.id) return 'buyer';
    if (actor.role === 'admin') return 'seller';
    if (actor.role === 'collaborator') {
        const property = await propertyModel.findById(offer.property).select('collaborator');
        if (property?.collaborator && String(property.collaborator) === actor.id) return 'seller';
    }
    return null;
}

const service = {

    async getAll({ search, page, limit, type }) {
        const skip = (page - 1) * limit;
        const filter = {};

        if (search) {
            const [matchingClients, matchingProperties] = await Promise.all([
                clientModel.find({
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { lastname: { $regex: search, $options: 'i' } },
                    ],
                }).select('_id'),
                propertyModel.find({ title: { $regex: search, $options: 'i' } }).select('_id'),
            ]);
            filter.$or = [
                { buyer: { $in: matchingClients.map(c => c._id) } },
                { property: { $in: matchingProperties.map(p => p._id) } },
            ];
        }

        if (type !== 'all') {
            const matchingProperties = await propertyModel.find({ listing_type: type }).select('_id');
            const ids = matchingProperties.map(p => p._id);
            if (filter.$or) {
                filter.$and = [{ $or: filter.$or }, { property: { $in: ids } }];
                delete filter.$or;
            } else {
                filter.property = { $in: ids };
            }
        }

        const [offers, total, statusCounts] = await Promise.all([
            model.find(filter)
                .populate('buyer', 'name lastname picture')
                .populate('property', 'title public_id listing_type pictures')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            model.countDocuments(filter),
            model.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        ]);

        const byStatus = Object.fromEntries(statusCounts.map(s => [s._id, s.count]));
        const metrics = {
            total: statusCounts.reduce((sum, s) => sum + s.count, 0),
            pending: (byStatus.pending || 0) + (byStatus.countered || 0),
            confirmed: byStatus.accepted || 0,
            completed: (byStatus.rejected || 0) + (byStatus.withdrawn || 0),
        };

        return { offers, total, metrics };
    },

    async getById(id) {
        const offer = await model.findById(id);
        if (!offer) throw new NotFoundError(
            'offer not found', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        return offer;
    },

    async create({ actor, property, price, moveInDate, rentalMonths, buyer }) {
        const isStaff = actor.role === 'admin' || actor.role === 'collaborator';
        const buyerId = (buyer && isStaff) ? buyer : actor.id;

        const propertyDoc = await propertyModel.findById(property);
        if (!propertyDoc) throw new NotFoundError(
            'property not found', {
            code: 'PROPERTY_NOT_FOUND',
            resource: 'property',
            id: property
        });
        if (propertyDoc.status !== 'available') throw new ConflictError(
            'property is not available for offers', {
            code: 'PROPERTY_NOT_AVAILABLE',
            resource: 'property',
            id: property,
            current_status: propertyDoc.status
        });
        if (String(propertyDoc.owner) === buyerId) throw new ConflictError(
            'cannot make an offer on your own property', {
            code: 'CANNOT_OFFER_ON_OWN_PROPERTY',
            resource: 'property',
            id: property
        });

        const duplicate = await model.findOne({
            buyer: buyerId,
            property,
            status: { $in: ACTIVE_STATUSES }
        });
        if (duplicate) throw new ConflictError(
            'an active offer already exists for this buyer and property', {
            code: 'ACTIVE_OFFER_ALREADY_EXISTS',
            resource: 'offer',
            id: duplicate._id
        });

        return await model.create({
            buyer: buyerId,
            property,
            price,
            move_in_date: moveInDate,
            rental_months: rentalMonths,
            last_actor: 'buyer',
            history: [{ price, actor: 'buyer' }],
        });
    },

    async counter(id, { actor, price }) {
        const offer = await model.findById(id);
        if (!offer) throw new NotFoundError(
            'offer not found', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        if (CLOSED_STATUSES.includes(offer.status)) throw new ConflictError(
            'cannot counter a closed offer', {
            code: 'OFFER_ALREADY_CLOSED',
            resource: 'offer',
            id,
            current_status: offer.status
        });

        const side = await determineSide(actor, offer);
        if (!side) throw new AuthorizationError(
            'you do not have standing to counter this offer', {
            code: 'FORBIDDEN_NOT_A_PARTY'
        });
        if (offer.last_actor === side) throw new ConflictError(
            'you must wait for the other party to respond', {
            code: 'AWAITING_OTHER_PARTY',
            resource: 'offer',
            id
        });

        offer.price = price;
        offer.status = 'countered';
        offer.last_actor = side;
        offer.history.push({ price, actor: side });
        await offer.save();
        return offer;
    },

    async resolve(id, { actor, status }) {
        const offer = await model.findById(id);
        if (!offer) throw new NotFoundError(
            'offer not found', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        if (CLOSED_STATUSES.includes(offer.status)) throw new ConflictError(
            'offer is already closed', {
            code: 'OFFER_ALREADY_CLOSED',
            resource: 'offer',
            id,
            current_status: offer.status
        });

        const side = await determineSide(actor, offer);
        if (!side) throw new AuthorizationError(
            'you do not have standing to resolve this offer', {
            code: 'FORBIDDEN_NOT_A_PARTY'
        });

        // aceptar o rechazar una oferta depende del comprador. De la misma manera,
        // retirarse de una oferta es una operación propia del comprador. Ninguno de los
        // dos puede tomar una decisión que dependa del otro
        const requiredSide = status === 'withdrawn' ? 'buyer' : 'seller';
        if (side !== requiredSide) throw new AuthorizationError(
            `only the ${requiredSide} side can mark an offer as ${status}`, {
            code: 'FORBIDDEN_WRONG_SIDE',
            required_side: requiredSide
        });

        offer.status = status;
        await offer.save();

        if (status === 'accepted') {
            await propertyModel.findByIdAndUpdate(offer.property, { status: 'occupied' });
        }

        return offer;
    },

    async update(id, { actor, moveInDate, rentalMonths }) {
        const offer = await model.findById(id);
        if (!offer) throw new NotFoundError(
            'offer not found', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        if (String(offer.buyer) !== actor.id) throw new AuthorizationError(
            'only the buyer can edit these details', {
            code: 'FORBIDDEN_NOT_BUYER'
        });
        if (offer.status !== 'pending') throw new ConflictError(
            'offer details can only be edited while pending', {
            code: 'OFFER_NOT_EDITABLE',
            resource: 'offer',
            id,
            current_status: offer.status
        });

        if (moveInDate !== undefined) offer.move_in_date = moveInDate;
        if (rentalMonths !== undefined) offer.rental_months = rentalMonths;
        await offer.save();
        return offer;
    },

    async delete(id) {
        const offer = await model.findByIdAndDelete(id);
        if (!offer) throw new NotFoundError(
            'offer not found', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        return { id, deleted: true };
    },
};
export default service;