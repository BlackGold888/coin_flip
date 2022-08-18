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

        player.on('close', () => {
            const playerData = this.players.get(player.name);
            const rooms = this.rooms.filter(room => room.id !== playerData.id);
            this.rooms = [...rooms];
            if (this.players.has(player.name)) {
                this.players.delete(playerData.name);
            }
            this.onlineUpdate();
            this.updateRooms();
        });

        player.on('player.login', this.playerLogin);
        player.on('player.register', this.playerRegister);
        player.on('create.room', this.createRoom);
        player.on('join.room', this.joinRoom);

    };

    playerLogin = (player) => {
        //Update online players
        this.onlineUpdate();
        this.updateRooms()

    };

    playerRegister = (player, name) => {
        console.log('asdasdasd');
        if (this.players.has(name)) {
            player.send(JSON.stringify({ eventName: 'player.register.fail' }))
            return this.clientNotify(player, 'This name exist', false);
        }

        const newPlayerData = new Player(name, 100, 0, this.players.size + 1);

        this.players.set(name, {
            player,
            ...newPlayerData,
        });

        player.name = name;
        console.log(player.name);


        player.send(JSON.stringify({ eventName: 'player.init', payload: newPlayerData }));

        this.playerLogin(player);
        this.clientNotify(player, 'Your account created', true);
    }

    createRoom = (player, data) => {
        const { id, bet } = data;
        const isRoomExist = this.rooms.find(room => room.id === id || room.players.includes(player.name));

        if (isRoomExist) {
            this.clientNotify(player, 'You are already in room', false);
            return;
        }

        this.rooms.push(new Room(id, bet, player.name));
        console.log(`${player.name} create room`);
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
        const playerData = this.players.get(player.name);
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
        // this.playersInRoom.set(playerData.id, player);
        this.players.get(player.name).bet = room.bet;
        this.players.get(player.name).roomId = room.id;
        room.players.push(player.name);
        this.rooms = this.rooms.filter(room => room.id !== roomId);
        this.rooms.push(room);
        this.updateRooms();
        if(room.maxPlayers == room.players.length) {
            this.startGame(room);
        }
    }

    startGame = (room) => {
        // let players = room.players;
        // let player1 = this.playersInRoom.get(players[0].id);
        // let player2 = this.playersInRoom.get(players[1].id);
        //
        // player1.send(JSON.stringify({ eventName: 'start.game', payload: { player: players[0], opponent: players[1] } }));
        // player2.send(JSON.stringify({ eventName: 'start.game', payload: { player: players[1], opponent: players[0] } }));
    }
}
