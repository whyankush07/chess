import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from "uuid";
import { GameManager } from './GameManager';
import { Matchmaker } from "./MatchMaker";
import { Publisher } from './Publisher';
import { RedisClient } from "./RedisClient";
import { User } from './User';

const PORT = Number(process.env.PORT ?? 8081);
const INSTANCE_ID = process.env.INSTANCE_ID ?? uuidv4();
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const redis = new RedisClient(REDIS_URL);
const publisher = new Publisher(redis);
const matchmaker = new Matchmaker(redis);
const gameManager = new GameManager(redis, publisher, matchmaker, INSTANCE_ID);

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`WebSocket server is listening on ws://localhost:${PORT} (instance ${INSTANCE_ID})`);
});

wss.on('connection', function connection(ws) {
  const user = new User("", ws);
  gameManager.addUser(user);
});