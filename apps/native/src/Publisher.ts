import { MOVE_EVENT, Game } from "@repo/types/chess";
import { RedisClient } from "./RedisClient";

export class Publisher {
    private warned: boolean;

    constructor(private readonly redis: RedisClient) {
        this.warned = false;
    }

    public async publishMoveEvent(move: MOVE_EVENT) {
        await this.publish("game:moves", move);
    }

    public async publishGameEvent(game: Game) {
        await this.publish("game:games", game);
    }

    private async publish(stream: string, payload: MOVE_EVENT | Game) {
        try {
            await this.redis.pub.xadd(stream, "*", "payload", JSON.stringify(payload));
        } catch (error) {
            this.handlePublishError(error);
        }
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