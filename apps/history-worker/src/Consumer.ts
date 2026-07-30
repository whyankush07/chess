import Redis from "ioredis";

const GROUP = "history-writers";
const CONSUMER = `worker-${process.pid}`;

export class Consumer {
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
            this.disableConsumer(error);
        });
    }

    public async ensureGroup(): Promise<void> {
        if (this.disabled) {
            return;
        }

        try {
            await this.client.xgroup("CREATE", "game:moves", GROUP, "0", "MKSTREAM");
        } catch (err) {
            if ((err as Error).message.includes("BUSYGROUP")) {
                return;
            }

            this.disableConsumer(err);
        }
    }

    public async consume(stream: string) : Promise<any> {
        if (this.disabled) {
            return null;
        }

        try {
            const result = await this.client.xreadgroup(
                "GROUP", GROUP, CONSUMER,
                "COUNT", "10",
                "BLOCK", "5000",
                "STREAMS", stream,
                ">"
            );
            return result;
        } catch (error) {
            this.disableConsumer(error);
            return null;
        }
    }

    public async acknowlegde(stream: string, id: string) {
        this.client.xack(stream, GROUP, id);
    }

    private disableConsumer(error: unknown) {
        if (this.warned) {
            this.disabled = true;
            return;
        }

        this.warned = true;
        this.disabled = true;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Redis consumer disabled: ${message}`);
        this.client.disconnect();
    }
}