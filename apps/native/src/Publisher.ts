import Redis from "ioredis";
import { MOVE_EVENT, Game } from "@repo/types/chess";

export class Publisher {
    private client: Redis;
    private warned: boolean;

    constructor(redisUrl: string = process.env.REDIS_URL ?? "redis://127.0.0.1:6379") {
        this.warned = false;
        this.client = new Redis(redisUrl, {
            lazyConnect: false,
            enableOfflineQueue: false,
            retryStrategy: (times) => {
                if (times > 5) {
                    return null;
                }
                return Math.min(times * 500, 2000);
            },
        });

        this.client.on("error", (error) => {
            this.handlePublishError(error);
        });
    }

    public async publishMoveEvent(move: MOVE_EVENT) {
        await this.publish("game:moves", move);
        console.log(`Published move event: ${JSON.stringify(move)}`);
    }

    public async publishGameEvent(game: Game) {
        await this.publish("game:games", game);
    }

    // ----------------------------------- //

    private async publish(stream: string, payload: MOVE_EVENT | Game) {
        try {
            await this.ensureConnected();
            await this.client.xadd(stream, "*", "payload", JSON.stringify(payload));
        } catch (error) {
            this.handlePublishError(error);
        }
    }

    private async ensureConnected() {
        if (this.client.status === "ready") {
            return;
        }

        if (this.client.status === "connecting" || this.client.status === "reconnecting") {
            await new Promise<void>((resolve) => {
                this.client.once("ready", () => resolve());
            });
            return;
        }

        await this.client.connect();
    }

    private handlePublishError(error: unknown) {
        if (this.warned) {
            return;
        }

        this.warned = true;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Redis publisher warning: ${message}`);
    }
}