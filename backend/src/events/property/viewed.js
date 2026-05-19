import EventBus from '../event_bus.js';
const EVENT = 'property.viewed';
export const emitPropertyViewed = async (payload) => { await EventBus.emit(EVENT, payload); };
export const onPropertyViewed = (listener) => { EventBus.on(EVENT, listener); };