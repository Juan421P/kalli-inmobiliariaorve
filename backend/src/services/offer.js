import model from '../models/offer.js';
import propertyModel from '../models/property.js';
import clientModel from '../models/client.js';
import NotFoundError from '../errors/not_found.js';
import ConflictError from '../errors/conflict.js';
import AuthorizationError from '../errors/authorization.js';
import { assertPriceInRange } from '../utils/offer_price_range.js';

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

// trae la propiedad de la oferta y verifica que siga disponible: una propiedad
// ocupada ya cerró con otra oferta, así que no tiene sentido seguir negociando
async function findAvailableProperty(propertyId, offerId) {
    const propertyDoc = await propertyModel.findById(propertyId);
    if (!propertyDoc) throw new NotFoundError(
        'la propiedad de esta oferta ya no existe', {
        code: 'PROPERTY_NOT_FOUND',
        resource: 'property',
        id: propertyId
    });
    if (propertyDoc.status !== 'available') throw new ConflictError(
        'la propiedad ya no está disponible, por lo que esta oferta no puede continuar', {
        code: 'PROPERTY_NOT_AVAILABLE',
        resource: 'property',
        id: propertyId,
        offer_id: offerId,
        current_status: propertyDoc.status
    });
    return propertyDoc;
}

// aceptar le toca solo al vendedor (admin o colaborador de la propiedad) y solo
// sobre la última propuesta del comprador: el cliente nunca acepta, y ORVE no
// puede aceptar su propia contraoferta
async function acceptOffer(offer, side) {
    const id = offer._id;
    if (side !== 'seller') throw new AuthorizationError(
        'solo ORVE (administrador o colaborador) puede aceptar una oferta', {
        code: 'FORBIDDEN_WRONG_SIDE',
        required_side: 'seller'
    });
    if (offer.last_actor === side) throw new ConflictError(
        'no puede aceptar su propia propuesta, debe esperar a que la otra parte responda', {
        code: 'AWAITING_OTHER_PARTY',
        resource: 'offer',
        id
    });

    // el monto se vuelve a validar contra el precio actual de la propiedad: no
    // basta con que la interfaz lo haya filtrado, ni con que fuera válido cuando
    // se propuso (el precio publicado pudo cambiar después)
    const propertyDoc = await findAvailableProperty(offer.property, id);
    assertPriceInRange(offer.price, propertyDoc, { action: 'accept', offerId: id });

    // primero se reserva la propiedad y luego se cierra la oferta, ambas con
    // condición, para que dos aceptaciones simultáneas (de la misma oferta o de
    // otra oferta sobre la misma propiedad) no puedan pasar las dos
    const reserved = await propertyModel.findOneAndUpdate(
        { _id: propertyDoc._id, status: 'available' },
        { status: 'occupied' },
    );
    if (!reserved) throw new ConflictError(
        'la propiedad ya no está disponible, por lo que esta oferta no puede continuar', {
        code: 'PROPERTY_NOT_AVAILABLE',
        resource: 'property',
        id: propertyDoc._id,
        offer_id: id
    });

    const accepted = await model.findOneAndUpdate(
        { _id: id, status: { $in: ACTIVE_STATUSES }, last_actor: offer.last_actor, price: offer.price },
        { status: 'accepted' },
        { returnDocument: 'after' },
    );
    if (!accepted) {
        await propertyModel.findByIdAndUpdate(propertyDoc._id, { status: 'available' });
        throw new ConflictError(
            'la oferta cambió o ya fue resuelta mientras se procesaba, recargue para ver su estado actual', {
            code: 'OFFER_ALREADY_CLOSED',
            resource: 'offer',
            id
        });
    }
    return accepted;
}

const service = {

    async getAll({ search, page, limit, type }, actor) {
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

        // un colaborador solo debe ver las ofertas de las propiedades que un admin
        // le asignó a él -no todas las que existen-, igual que ya pasa con las
        // citas (ver services/appointment.js: getAll). Se aplica también a las
        // métricas para que el resumen no filtre información de otras propiedades
        const collaboratorFilter = {};
        if (actor?.role === 'collaborator') {
            const assignedProperties = await propertyModel.find({ collaborator: actor.id }).select('_id');
            collaboratorFilter.property = { $in: assignedProperties.map(p => p._id) };
        }
        const scopedFilter = Object.keys(collaboratorFilter).length
            ? { $and: [filter, collaboratorFilter] }
            : filter;

        const [offers, total, statusCounts] = await Promise.all([
            model.find(scopedFilter)
                .populate('buyer', 'name lastname email phone picture')
                .populate('property', 'title public_id listing_type pictures price status')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            model.countDocuments(scopedFilter),
            model.aggregate([{ $match: collaboratorFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
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
        const offer = await model.findById(id)
            .populate('buyer', 'name lastname email phone picture')
            .populate('property', 'title public_id listing_type pictures price status');
        if (!offer) throw new NotFoundError(
            'oferta no encontrada', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        return offer;
    },

    async create({ actor, property, price, move_in_date: moveInDate, rental_months: rentalMonths, buyer }) {
        const isStaff = actor.role === 'admin' || actor.role === 'collaborator';
        const buyerId = (buyer && isStaff) ? buyer : actor.id;

        const propertyDoc = await propertyModel.findById(property);
        if (!propertyDoc) throw new NotFoundError(
            'la propiedad no existe', {
            code: 'PROPERTY_NOT_FOUND',
            resource: 'property',
            id: property
        });
        if (propertyDoc.status !== 'available') throw new ConflictError(
            'la propiedad no está disponible para recibir ofertas', {
            code: 'PROPERTY_NOT_AVAILABLE',
            resource: 'property',
            id: property,
            current_status: propertyDoc.status
        });
        if (String(propertyDoc.owner) === buyerId) throw new ConflictError(
            'no puede hacer una oferta sobre su propia propiedad', {
            code: 'CANNOT_OFFER_ON_OWN_PROPERTY',
            resource: 'property',
            id: property
        });

        // un cliente puede ofertar en todas las propiedades que quiera, pero solo
        // una vez por propiedad: cuenta cualquier oferta previa, también las
        // rechazadas o aceptadas. Las retiradas se eliminan, no quedan registradas
        const duplicate = await model.findOne({ buyer: buyerId, property });
        if (duplicate) throw new ConflictError(
            'Solo puede hacerse una oferta a la vez por propiedad', {
            code: 'OFFER_ALREADY_EXISTS',
            resource: 'offer',
            id: duplicate._id,
            current_status: duplicate.status,
            last_actor: duplicate.last_actor
        });

        assertPriceInRange(price, propertyDoc);

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
            'oferta no encontrada', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        if (CLOSED_STATUSES.includes(offer.status)) throw new ConflictError(
            'no se puede contraofertar una oferta ya cerrada', {
            code: 'OFFER_ALREADY_CLOSED',
            resource: 'offer',
            id,
            current_status: offer.status
        });

        const side = await determineSide(actor, offer);
        if (!side) throw new AuthorizationError(
            'usted no tiene autoridad para contraofertar en esta oferta', {
            code: 'FORBIDDEN_NOT_A_PARTY'
        });
        if (offer.last_actor === side) throw new ConflictError(
            'debe esperar a que la otra parte responda', {
            code: 'AWAITING_OTHER_PARTY',
            resource: 'offer',
            id
        });

        const propertyDoc = await findAvailableProperty(offer.property, id);
        assertPriceInRange(price, propertyDoc, { offerId: id });

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
            'oferta no encontrada', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        if (CLOSED_STATUSES.includes(offer.status)) throw new ConflictError(
            'la oferta ya está cerrada', {
            code: 'OFFER_ALREADY_CLOSED',
            resource: 'offer',
            id,
            current_status: offer.status
        });

        const side = await determineSide(actor, offer);
        if (!side) throw new AuthorizationError(
            'usted no tiene autoridad para resolver esta oferta', {
            code: 'FORBIDDEN_NOT_A_PARTY'
        });

        if (status === 'accepted') return await acceptOffer(offer, side);

        // rechazar una oferta le toca al vendedor y retirarse de ella, al
        // comprador. Ninguno de los dos puede tomar una decisión que dependa del otro
        const requiredSide = status === 'withdrawn' ? 'buyer' : 'seller';
        if (side !== requiredSide) throw new AuthorizationError(
            `solo la parte ${requiredSide === 'buyer' ? 'compradora' : 'vendedora'} puede marcar una oferta como ${status}`, {
            code: 'FORBIDDEN_WRONG_SIDE',
            required_side: requiredSide
        });

        // al retirarse, la oferta no queda como un registro cerrado más: desaparece
        // por completo, tanto del lado del comprador como del vendedor
        if (status === 'withdrawn') {
            await model.findByIdAndDelete(id);
            offer.status = 'withdrawn';
            return offer;
        }

        offer.status = status;
        await offer.save();
        return offer;
    },

    async update(id, { actor, move_in_date: moveInDate, rental_months: rentalMonths }) {
        const offer = await model.findById(id);
        if (!offer) throw new NotFoundError(
            'oferta no encontrada', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        if (String(offer.buyer) !== actor.id) throw new AuthorizationError(
            'solo el comprador puede editar estos datos', {
            code: 'FORBIDDEN_NOT_BUYER'
        });
        if (offer.status !== 'pending') throw new ConflictError(
            'los datos de la oferta solo pueden editarse mientras está pendiente', {
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
            'oferta no encontrada', {
            code: 'OFFER_NOT_FOUND',
            resource: 'offer',
            id
        });
        return { id, deleted: true };
    },
};
export default service;