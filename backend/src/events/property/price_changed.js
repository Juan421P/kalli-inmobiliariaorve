import EventBus from '../event_bus.js';
const EVENT = 'property.price_changed';
export const emitPropertyPriceChanged = async (payload) => { await EventBus.emit(EVENT, payload); };
export const onPropertyPriceChanged = (listener) => { EventBus.on(EVENT, listener); };