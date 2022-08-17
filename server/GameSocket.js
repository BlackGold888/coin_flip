import { WebSocketServer } from 'ws';
import { Player } from './Player.js';

class GameSocket extends WebSocketServer {
    constructor(server) {
        super({ server });
        this.players = new Map();
        this.on('connection', this.onConnection);
    }

    onConnection(player) {

        this.players.set(player, new Player('Player', 1000, 0, player.id));

        player.on('message', (data) => {
            const parsed = JSON.parse(data);
            const { eventName, payload } = parsed;
            player.emit(eventName, payload);
        });

        //Update online players
        this.clients.forEach(client => {
            client.send(JSON.stringify({ eventName: 'online.update', payload: this.players.size }));
        });
    }
}
