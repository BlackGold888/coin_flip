class Emitter {

    constructor() {
        this.events = {};
    }

    on(eventName, callback) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(callback);
    }

    emit(eventName, payload) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].forEach(callback => callback(payload));
    }
}

export { Emitter };
