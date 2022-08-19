import { WebSocketServer } from 'ws';
import { Player } from './Player.js';
import { Room } from './Room.js';

export class GameSocket {
    constructor(server) {
        this.socket = new WebSocketServer({ server });
        this.players = new Map();
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
            const room = this.rooms.find(room => room.players.includes(playerData.name));

            if (room.players.length > 1) {
                room.players.forEach(playerName => {
                    let target = this.players.get(playerName);
                    this.clientNotify(target.handle, 'Room Owner Disconnected', false);
                    this.stopGame(target)
                })
            }

            //Update rooms list
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
        player.on('delete.room', this.deleteRoom);
        player.on('make.choose', this.makeChoose);
        player.on('game.stop', this.playerExitRoom);
    };

    playerLogin = (player) => {
        //Update online players
        this.onlineUpdate();
        this.updateRooms()

    };

    playerRegister = (player, name) => {
        if (this.players.has(name)) {
            player.send(JSON.stringify({ eventName: 'player.register.fail' }))
            return this.clientNotify(player, 'This name exist', false);
        }

        const newPlayerData = new Player(name, 100, 0, this.players.size + 1);

        this.players.set(name, {
            handle: player,
            ...newPlayerData,
        });

        player.name = name;


        player.send(JSON.stringify({ eventName: 'player.init', payload: newPlayerData }));

        this.playerLogin(player);
        this.clientNotify(player, 'Your account created', true);
    }

    createRoom = (player, data) => {
        const { id, bet } = data;
        const isRoomExist = this.rooms.find(room => room.id === id || room.players.includes(player.name));
        const playerData = this.players.get(player.name);

        if (bet <= 0) {
            return this.clientNotify(player, 'Bet must be greater than 0', false);
        }

        if (isRoomExist) {
            this.clientNotify(player, 'You are already in room', false);
            return;
        }

        if(playerData.balance < bet){
            this.clientNotify(player, 'You don\'t have enough money', false);
            return;
        }

        this.rooms.push(new Room(id, bet, player.name));
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

    deleteRoom = (player, data) => {
        const owner = this.players.get(player.name);

        if (owner.id !== data.roomId) {
            this.clientNotify(player, 'You are not owner of this room', false);
            return;
        }

        const rooms = this.rooms.filter(room => room.id !== data.roomId);
        this.rooms = [...rooms];
        this.updateRooms();
        this.clientNotify(player, 'Room deleted', true);
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

        if (this.rooms.find(room => room.id === playerData.id)) {
            this.clientNotify(player, 'You have created room', false);
            return;
        }

        if (playerData.balance < room.bet) {
            this.clientNotify(player, 'You don\'t have enough money', false);
            return;
        }

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
        let players = room.players;
        let player1 = this.players.get(players[0]);
        let player2 = this.players.get(players[1]);

        player1.handle.send(JSON.stringify({ eventName: 'start.game', payload: { player: players[0], opponent: players[1] } }));
        player2.handle.send(JSON.stringify({ eventName: 'start.game', payload: { player: players[1], opponent: players[0] } }));
    }

    playerUpdate = (player, winner) => {
        let updatePlayer = new Player(player.name, player.balance, 0, player.id);
        player.handle.send(JSON.stringify({ eventName: 'player.update', payload: updatePlayer }))
        // this.stopGame(player);
    }

    stopGame = (player) => {
        player.handle.send(JSON.stringify({ eventName: 'stop.game' }))
    }

    setFlip = (player, winner) => {
        console.log(player.name);
         player.handle.send(JSON.stringify({ eventName: 'set.flip', payload: winner }))
    }

    playerExitRoom = (player) => {
        let room = this.rooms.find(room => room.players.includes(player.name));
        if (room) {
            room.players.forEach(playerName => {
                let target = this.players.get(playerName);
                this.clientNotify(target.handle, 'Player leave from room', false);
                this.stopGame(target)
            })

            let rooms = this.rooms.filter(r => r.id != room.id);

            this.rooms = [...rooms];
            this.updateRooms()
        }
    }
    delay = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    makeChoose = async (player, data) => {
        let room = this.rooms.find(room => room.players.includes(player.name));
        let playerData = this.players.get(player.name);
        if (room.bet > playerData.balance) {
            this.clientNotify(player, 'You don\'t have enough money', false);
            this.playerExitRoom(player);
            return;
        }

        if (room.choose[player.name]) {
            return this.clientNotify(player, 'You already choose', false);
        }

        let players = room.players;
        let player1 = this.players.get(players[0]);
        let player2 = this.players.get(players[1]);
        if (player.name == players[0]) {
            this.clientNotify(player2.handle, `${ player.name } make choose`, true);
        }else{
            this.clientNotify(player1.handle, `${ player.name } make choose`, true);
        }

        let winner = room.setChoose(player.name, data);
        if (winner != null) {
            let winnerName = room.players[winner];

            if (!winnerName) {
                this.clientNotify(player1.handle, 'No winner', true);
                this.clientNotify(player2.handle, 'No winner', true);
                this.setFlip(player1, winner);
                this.setFlip(player2, winner);
                room.clearChoose();
                return;
            }

            await this.delay(3000);

            room.players.forEach(target => {
                let player = this.players.get(target);
                if (player.name == winnerName) {
                    this.clientNotify(player.handle, 'You win', true);
                    player.balance += parseInt(room.bet);
                } else {
                    player.balance -= room.bet;
                    this.clientNotify(player.handle, 'You lose', false);
                }

                this.setFlip(player, winner);
                this.playerUpdate(player);
            });
            room.clearChoose();
        }
    }
}
