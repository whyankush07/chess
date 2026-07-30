import Redis from "ioredis";
import { MOVE_EVENT } from "@repo/types/chess";
import { Game } from "./Game";

export class Publisher {
    private client: Redis;
    private disabled: boolean;
    private warned: boolean;

    constructor(redisUrl: string = process.env.REDIS_URL ?? "redis://127.0.0.1:6379") {
        this.disabled = false;
        this.warned = false;
        this.client = new Redis(redisUrl, {
            lazyConnect: true,
            enableOfflineQueue: false,
            retryStrategy: () => null,
        });

        this.client.on("error", (error) => {
            this.disablePublishing(error);
        });
    }

    public async publishMoveEvent(move: MOVE_EVENT) {
        await this.publish("game:moves", move);
    }

    public async publishGameEvent(game: Game) {
        await this.publish("game:games", game);
    }

    private async publish(stream: string, payload: MOVE_EVENT | Game) {
        if (this.disabled) {
            return;
        }

        try {
            await this.client.xadd(stream, "*", "payload", JSON.stringify(payload));
        } catch (error) {
            this.disablePublishing(error);
        }
    }

    private disablePublishing(error: unknown) {
        if (this.warned) {
            this.disabled = true;
            return;
        }

        this.warned = true;
        this.disabled = true;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Redis publisher disabled: ${message}`);
        this.client.disconnect();
    }
}