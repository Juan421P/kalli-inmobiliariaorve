import EventBus from '../event_bus.js';
const EVENT = 'offer.accepted';
export const emitPropertyCreated = async (payload) => { await EventBus.emit(EVENT, payload); };
export const onPropertyCreated = (listener) => { EventBus.on(EVENT, listener); };