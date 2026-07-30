import Redis from "ioredis";

const GROUP = "history-writers";
const CONSUMER = `worker-${process.pid}`;

export class Consumer {
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
            this.handleConsumerError(error);
        });
    }

    public async ensureGroup(): Promise<void> {
        try {
            await this.ensureConnected();
            await this.client.xgroup("CREATE", "game:moves", GROUP, "0", "MKSTREAM");
            console.log(`Consumer group '${GROUP}' created for stream 'game:moves'`);
        } catch (err) {
            if ((err as Error).message.includes("BUSYGROUP")) {
                return;
            }

            this.handleConsumerError(err);
        }
    }

    public async consume(stream: string): Promise<any> {
        try {
            await this.ensureConnected();
            const result = await this.client.xreadgroup(
                "GROUP", GROUP, CONSUMER,
                "COUNT", "10",
                "BLOCK", "5000",
                "STREAMS", stream,
                ">"
            );
            return result;
        } catch (error) {
            this.handleConsumerError(error);
            return null;
        }
    }

    public async acknowlegde(stream: string, id: string) {
        await this.ensureConnected();
        await this.client.xack(stream, GROUP, id);
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

    private handleConsumerError(error: unknown) {
        if (this.warned) {
            return;
        }

        this.warned = true;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Redis consumer warning: ${message}`);
    }
}