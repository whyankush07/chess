import { RedisClient } from "./RedisClient";

const CLAIM_OR_WAIT_SCRIPT = `
local pending = redis.call('GET', KEYS[1])
if pending then
  redis.call('DEL', KEYS[1])
  return pending
else
  redis.call('SET', KEYS[1], ARGV[1] .. '|' .. ARGV[2])
  return false
end
`;

const RELEASE_PENDING_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if current == ARGV[1] then
  redis.call('DEL', KEYS[1])
  return 1
end
return 0
`;

export class Matchmaker {
    private readonly claimOrWait: (key: string, userId: string, instanceId: string) => Promise<string | false | null>;
    private readonly releasePending: (key: string, tag: string) => Promise<number>;

    constructor(private readonly redis: RedisClient) {
        const client = redis.pub as unknown as {
            claimOrWait: (key: string, userId: string, instanceId: string) => Promise<string | false | null>;
            releasePending: (key: string, tag: string) => Promise<number>;
        };
        redis.pub.defineCommand("claimOrWait", { numberOfKeys: 1, lua: CLAIM_OR_WAIT_SCRIPT });
        redis.pub.defineCommand("releasePending", { numberOfKeys: 1, lua: RELEASE_PENDING_SCRIPT });
        this.claimOrWait = client.claimOrWait.bind(client);
        this.releasePending = client.releasePending.bind(client);
    }

    async findOrWait(userId: string, instanceId: string): Promise<{ userId: string; instanceId: string } | null> {
        const result = await this.claimOrWait("matchmaking:pending", userId, instanceId);
        if (!result) {
            return null;
        }
        const [opponentUserId, opponentInstanceId] = (result as string).split("|");
        return { userId: opponentUserId, instanceId: opponentInstanceId };
    }

    async release(userId: string, instanceId: string): Promise<void> {
        await this.releasePending("matchmaking:pending", `${userId}|${instanceId}`);
    }
}