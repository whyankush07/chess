import Redis from "ioredis";
import { MOVE_EVENT } from "@repo/types/chess";
import { Game } from "./Game";

export class Publisher {
    private client: Redis;

    constructor(redisUrl: string) {
        this.client = new Redis(redisUrl);
    }

    public async publishMoveEvent(move: MOVE_EVENT) {
        await this.client.xadd(
            "game:moves",
            "*",
            "payload",
            JSON.stringify(move)
        );
    }

    public async publishGameEvent(game: Game) {
        await this.client.xadd(
            "game:games",
            "*",
            "payload",
            JSON.stringify(game)
        );
    }
}