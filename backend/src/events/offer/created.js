import EventBus from '../event_bus.js';
const EVENT = 'offer.created';
export const emitPropertyCreated = async (payload) => { await EventBus.emit(EVENT, payload); };
export const onPropertyCreated = (listener) => { EventBus.on(EVENT, listener); };