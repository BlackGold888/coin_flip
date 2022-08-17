import { WebSocketServer } from 'ws';
import { Player } from './Player.js';
import { Room } from './Room.js';

export class GameSocket {
    constructor(server) {
        this.socket = new WebSocketServer({ server });
        this.players = new Map();
        this.playersInRoom = new Map();
        this.rooms = [];
        this.socket.on('connection', this.onConnection);
    }

    onConnection = (player) => {
        player.on('message', (data) => {
            const parsed = JSON.parse(data);
            const { eventName, payload } = parsed;
            player.emit(eventName, player, payload);
        });

        player.on('player.login', this.playerLogin);
        player.on('create.room', this.createRoom);
        player.on('join.room', this.joinRoom);
        player.on('close', () => this.playerLogout(player));
    };

    playerLogin = (player, data) => {
        const { name, balance, id } = data;
        if (!this.players.has(player)) {
            this.players.set(player, new Player(name, balance, 0, id));
        }

        //Update online players
        this.onlineUpdate();
        this.updateRooms()

    };

    playerLogout = (player) => {
        const playerData = this.players.get(player);

        const rooms = this.rooms.filter(room => room.id !== playerData.id);
        this.rooms = [...rooms];
        if (this.players.has(player)) {
            this.players.delete(player);
        }
        this.onlineUpdate();
        this.updateRooms();
    }

    createRoom = (player, data) => {
        console.log('create room');
        const { id, bet } = data;
        const isRoomExist = this.rooms.find(room => room.id === id);

        if (isRoomExist) {
            this.clientNotify(player, 'You are already in room', false);
            return;
        }

        const target = this.players.get(player);
        this.playersInRoom.set(id, player);
        this.rooms.push(new Room(id, bet, target));
        this.updateRooms();
    }

    clientNotify = (player, message, status) => {
        player.send(JSON.stringify({ eventName: 'notify', payload: { status, message } }));
    }

    updateRooms = () => {
        this.socket.clients.forEach(client => {
            client.send(JSON.stringify({ eventName: 'update.rooms', payload: this.rooms }));
        });
    }

    onlineUpdate = () => {
        this.socket.clients.forEach(client => {
            client.send(JSON.stringify({ eventName: 'online.update', payload: this.players.size }));
        });
    }

    joinRoom = (player, data) => {
        const { roomId } = data;
        const playerData = this.players.get(player);
        const room = this.rooms.find(room => room.id === roomId);

        if (!room) {
            this.clientNotify(player, 'Room not found', false);
            return;
        }

        if (room.players.length === room.maxPlayers) {
            this.clientNotify(player, 'Room is full', false);
            return;
        }

        if (room.players.find(p => p.id === playerData.id)) {
            this.clientNotify(player, 'You are already in room', false);
            return;
        }
        this.playersInRoom.set(playerData.id, player);
        // this.players.get(player).bet = room.bet;
        // this.players.get(player).roomId = room.id;
        room.players.push(playerData);
        this.rooms = this.rooms.filter(room => room.id !== roomId);
        this.rooms.push(room);
        this.updateRooms();
        if(room.maxPlayers == room.players.length) {
            this.startGame(room);
        }
    }

    startGame = (room) => {
        let players = room.players;
        let player1 = this.playersInRoom.get(players[0].id);
        let player2 = this.playersInRoom.get(players[1].id);

        player1.send(JSON.stringify({ eventName: 'start.game', payload: { player: players[0], opponent: players[1] } }));
        player2.send(JSON.stringify({ eventName: 'start.game', payload: { player: players[1], opponent: players[0] } }));
    }
}
