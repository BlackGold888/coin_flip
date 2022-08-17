import {emitter as Emitter} from './events';

export class GameSocket extends WebSocket{
    constructor(url) {
        super(url);
        this.socket = new WebSocket(url);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    }

    onOpen() {
        console.log('connected');
    }

    onMessage(event) {
        const { eventName, payload } = JSON.parse(event.data);
        Emitter.emit(eventName, payload);
    }

    onClose() {
        console.log('disconnected');
    }

    callRemote(eventName, payload) {
        this.socket.send(JSON.stringify({ eventName, payload }));
    }
}
