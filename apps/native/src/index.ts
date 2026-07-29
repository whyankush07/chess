import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import { Publisher } from './Publisher';

const wss = new WebSocketServer({ port: 8080 });

const publisher = new Publisher(process.env.REDISURL || "redis://localhost:6379");

const gameManager = new GameManager(publisher); 

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