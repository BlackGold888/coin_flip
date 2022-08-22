import express from 'express';
import http from 'http';

import { GameSocket } from './GameSocket.js';

const app = express();
app.use(express.json());

const server = http.createServer(app);
const gameSocket = new GameSocket(server);

server.listen(3002, () => {
    console.log('Server started on port 3000');
});

