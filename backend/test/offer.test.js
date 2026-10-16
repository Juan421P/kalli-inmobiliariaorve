// pruebas del flujo de ofertas (services/offer.js). Los modelos de mongoose se
// reemplazan por funciones falsas, así que no necesitan base de datos.
// Correr con: npm test
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import model from '../src/models/offer.js';
import propertyModel from '../src/models/property.js';
import service from '../src/services/offer.js';
import { getAllowedRange } from '../src/utils/offer_price_range.js';

const PROPERTY_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const OFFER_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const BUYER_ID = 'cccccccccccccccccccccccc';
const OWNER_ID = 'dddddddddddddddddddddddd';

const buyer = { id: BUYER_ID, role: 'client' };
const admin = { id: 'eeeeeeeeeeeeeeeeeeeeeeee', role: 'admin' };

// propiedad de $500,000 -> monto mínimo $425,000, sin tope máximo
let property;
let offer;
let propertyUpdates;

const makeOffer = (fields) => ({
    _id: OFFER_ID,
    buyer: BUYER_ID,
    property: PROPERTY_ID,
    history: [],
    async save() { return this; },
    ...fields,
});

// imita el filtro de findOneAndUpdate solo con los campos que usa el servicio
const matches = (doc, filter) => Object.entries(filter).every(([key, cond]) => {
    if (key === '_id') return true;
    if (cond && typeof cond === 'object' && '$in' in cond) return cond.$in.includes(doc[key]);
    return doc[key] === cond;
});

beforeEach(() => {
    property = { _id: PROPERTY_ID, price: 500000, status: 'available', owner: OWNER_ID };
    offer = null;
    propertyUpdates = [];

    propertyModel.findById = async () => property;
    propertyModel.findOneAndUpdate = async (filter, update) => {
        if (!matches(property, filter)) return null;
        Object.assign(property, update);
        propertyUpdates.push(update);
        return property;
    };
    propertyModel.findByIdAndUpdate = async (id, update) => {
        Object.assign(property, update);
        propertyUpdates.push(update);
        return property;
    };

    model.findById = async () => offer;
    model.findOne = async (filter) => (offer && matches(offer, filter) ? offer : null);
    model.create = async (data) => makeOffer(data);
    model.findOneAndUpdate = async (filter, update) => {
        if (!offer || !matches(offer, filter)) return null;
        Object.assign(offer, update);
        return offer;
    };
});

const rejectsWith = (promise, status, code) => assert.rejects(promise, (err) => {
    assert.equal(err.status, status, err.message);
    assert.equal(err.meta?.code, code);
    return true;
});

test('el monto mínimo es el 70% del precio publicado, sin máximo', () => {
    assert.deepEqual(getAllowedRange(500000), { min: 350000 });
});

test('no deja ofertar de nuevo sobre una propiedad con oferta pendiente o en contraoferta', async () => {
    for (const fields of [
        { status: 'pending', last_actor: 'buyer', price: 450000 },
        { status: 'countered', last_actor: 'seller', price: 480000 },
    ]) {
        offer = makeOffer(fields);
        await assert.rejects(
            service.create({ actor: buyer, property: PROPERTY_ID, price: 460000 }),
            (err) => {
                assert.equal(err.status, 409);
                assert.equal(err.meta.code, 'OFFER_ALREADY_EXISTS');
                assert.equal(err.message, 'Solo puede hacerse una oferta a la vez por propiedad');
                return true;
            },
        );
    }
});

test('no se puede ofertar de nuevo sobre una propiedad ya ofertada, aunque la oferta esté cerrada', async () => {
    for (const status of ['rejected', 'accepted']) {
        offer = makeOffer({ status, last_actor: 'buyer', price: 450000 });
        await rejectsWith(service.create({ actor: buyer, property: PROPERTY_ID, price: 460000 }), 409, 'OFFER_ALREADY_EXISTS');
    }
});

test('no deja crear una oferta por debajo del mínimo', async () => {
    await rejectsWith(service.create({ actor: buyer, property: PROPERTY_ID, price: 1 }), 422, 'OFFER_PRICE_BELOW_MIN');
    await rejectsWith(service.create({ actor: buyer, property: PROPERTY_ID, price: 349999 }), 422, 'OFFER_PRICE_BELOW_MIN');
});

test('acepta el monto mínimo justo y montos por encima del precio publicado', async () => {
    assert.equal((await service.create({ actor: buyer, property: PROPERTY_ID, price: 350000 })).price, 350000);
    assert.equal((await service.create({ actor: buyer, property: PROPERTY_ID, price: 500000 })).price, 500000);
    assert.equal((await service.create({ actor: buyer, property: PROPERTY_ID, price: 650000 })).price, 650000);
});

test('una contraoferta de $1 se rechaza por estar fuera del rango', async () => {
    offer = makeOffer({ status: 'countered', last_actor: 'seller', price: 500000 });
    await rejectsWith(service.counter(OFFER_ID, { actor: buyer, price: 1 }), 422, 'OFFER_PRICE_BELOW_MIN');
    assert.equal(offer.price, 500000, 'la oferta no debe cambiar');
});

test('una contraoferta dentro del rango se registra', async () => {
    offer = makeOffer({ status: 'countered', last_actor: 'seller', price: 500000 });
    const updated = await service.counter(OFFER_ID, { actor: buyer, price: 470000 });
    assert.equal(updated.price, 470000);
    assert.equal(updated.status, 'countered');
    assert.equal(updated.last_actor, 'buyer');
    assert.deepEqual(updated.history.at(-1), { price: 470000, actor: 'buyer' });
});

test('no se puede aceptar una oferta por debajo del mínimo', async () => {
    // oferta guardada antes de existir la validación, o el precio publicado subió
    offer = makeOffer({ status: 'pending', last_actor: 'buyer', price: 1 });
    await assert.rejects(
        service.resolve(OFFER_ID, { actor: admin, status: 'accepted' }),
        (err) => err.status === 422 && err.meta.code === 'OFFER_PRICE_BELOW_MIN' && /no se puede aceptar/.test(err.message),
    );
    assert.equal(offer.status, 'pending');
    assert.equal(property.status, 'available');
});

test('el cliente acepta la contraoferta de ORVE y la propiedad queda ocupada', async () => {
    offer = makeOffer({ status: 'countered', last_actor: 'seller', price: 480000 });
    const accepted = await service.resolve(OFFER_ID, { actor: buyer, status: 'accepted' });
    assert.equal(accepted.status, 'accepted');
    assert.equal(property.status, 'occupied');
});

test('el vendedor acepta la oferta del cliente', async () => {
    offer = makeOffer({ status: 'pending', last_actor: 'buyer', price: 450000 });
    const accepted = await service.resolve(OFFER_ID, { actor: admin, status: 'accepted' });
    assert.equal(accepted.status, 'accepted');
});

test('nadie puede aceptar su propia propuesta', async () => {
    offer = makeOffer({ status: 'pending', last_actor: 'buyer', price: 450000 });
    await rejectsWith(service.resolve(OFFER_ID, { actor: buyer, status: 'accepted' }), 409, 'AWAITING_OTHER_PARTY');
    offer = makeOffer({ status: 'countered', last_actor: 'seller', price: 480000 });
    await rejectsWith(service.resolve(OFFER_ID, { actor: admin, status: 'accepted' }), 409, 'AWAITING_OTHER_PARTY');
});

test('aceptar dos veces la misma oferta falla la segunda vez', async () => {
    offer = makeOffer({ status: 'countered', last_actor: 'seller', price: 480000 });
    await service.resolve(OFFER_ID, { actor: buyer, status: 'accepted' });
    await rejectsWith(service.resolve(OFFER_ID, { actor: buyer, status: 'accepted' }), 409, 'OFFER_ALREADY_CLOSED');
});

test('si la oferta cambia mientras se acepta, no se acepta y la propiedad se libera', async () => {
    offer = makeOffer({ status: 'countered', last_actor: 'seller', price: 480000 });
    // otra petición la cerró justo entre la lectura y la escritura
    model.findOneAndUpdate = async () => null;
    await rejectsWith(service.resolve(OFFER_ID, { actor: buyer, status: 'accepted' }), 409, 'OFFER_ALREADY_CLOSED');
    assert.equal(property.status, 'available');
});

test('no se puede aceptar una oferta rechazada, retirada o ya aceptada', async () => {
    for (const status of ['rejected', 'withdrawn', 'accepted']) {
        offer = makeOffer({ status, last_actor: 'seller', price: 480000 });
        await rejectsWith(service.resolve(OFFER_ID, { actor: buyer, status: 'accepted' }), 409, 'OFFER_ALREADY_CLOSED');
    }
});

test('no se puede aceptar ni contraofertar si la propiedad ya está ocupada', async () => {
    property.status = 'occupied';
    offer = makeOffer({ status: 'countered', last_actor: 'seller', price: 480000 });
    await rejectsWith(service.resolve(OFFER_ID, { actor: buyer, status: 'accepted' }), 409, 'PROPERTY_NOT_AVAILABLE');
    await rejectsWith(service.counter(OFFER_ID, { actor: buyer, price: 470000 }), 409, 'PROPERTY_NOT_AVAILABLE');
});

test('rechazar y retirar siguen funcionando como antes', async () => {
    offer = makeOffer({ status: 'pending', last_actor: 'buyer', price: 450000 });
    await rejectsWith(service.resolve(OFFER_ID, { actor: buyer, status: 'rejected' }), 403, 'FORBIDDEN_WRONG_SIDE');
    const rejected = await service.resolve(OFFER_ID, { actor: admin, status: 'rejected' });
    assert.equal(rejected.status, 'rejected');
    assert.equal(property.status, 'available');
});
