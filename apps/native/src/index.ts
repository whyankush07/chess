import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on('listening', () => {
  console.log('WebSocket server is listening on ws://localhost:8080');
});

wss.on('connection', function connection(ws) {
  gameManager.addUser(ws);

  // ws.on('message', function incoming(message) {
  //   console.log('received: %s', message);
  // });

  // ws.on("close", () => gameManager.removeUser(ws));
});