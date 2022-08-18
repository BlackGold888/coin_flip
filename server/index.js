import express from 'express';
import http from 'http';
import cors from 'cors';

import { GameSocket } from './GameSocket.js';
import { Player } from './Player.js';

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001'
}));

const players = new Map();
app.post('/savePlayer', (req, res) => {
    const { name } = req.body;
    if (players.has(name)) {
        res.status(200).json(players.get(name));
        console.log('Player already exists');
        return;
    }

    console.log('ssssssssss');
    const player = new Player(name, 10000, 0, players.size);
    players.set(name, player);
    console.log(player);
    res.status(200).json(players.get(name));
});

const server = http.createServer(app);
const gameSocket = new GameSocket(server);

server.listen(3000, () => {
    console.log('Server started on port 3000');
});

