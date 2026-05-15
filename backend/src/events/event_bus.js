class EventBus {
    constructor() { this.events = {}; }
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }
    async emit(event, payload) {
        if (!this.events[event]) return;
        await Promise.all(this.events[event].map(listener => listener(payload)));
    }
}
export default new EventBus();