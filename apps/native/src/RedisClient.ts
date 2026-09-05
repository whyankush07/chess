import Redis from "ioredis";
import type { RedisOptions } from "ioredis";

export class RedisClient {
    private readonly publisher: Redis;
    private readonly subscriber: Redis;

    constructor(url: string, options: RedisOptions = {}) {
        this.publisher = new Redis(url, {
            enableOfflineQueue: false,
            retryStrategy: (times) => {
                if (times > 5) {
                    return null;
                }
                return Math.min(times * 500, 2000);
            },
            ...options,
        });
        this.subscriber = this.publisher.duplicate();
        this.publisher.on("error", () => undefined);
        this.subscriber.on("error", () => undefined);
    }

    get pub(): Redis {
        return this.publisher;
    }

    get sub(): Redis {
        return this.subscriber;
    }

    quit() {
        this.publisher.quit();
        this.subscriber.quit();
    }
}