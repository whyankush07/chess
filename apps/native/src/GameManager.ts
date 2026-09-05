import { v4 as uuidv4 } from "uuid";
import { GAME_OVER, INIT_GAME, MOVE } from "@repo/types/message";
import { Game as GameMeta, GameStatus, TimeControl } from "@repo/types/chess";
import { Game } from "./Game";
import { Matchmaker } from "./MatchMaker";
import { Publisher } from "./Publisher";
import { RedisClient } from "./RedisClient";
import { User } from "./User";

interface ControlMessage {
    type: string;
    gameId: string;
    whiteId: string;
    blackId: string;
    instanceId?: string;
}

export class GameManager {
    private readonly redis: RedisClient;
    private readonly publisher: Publisher;
    private readonly matchmaker: Matchmaker;
    private readonly instanceId: string;
    private readonly controlChannel: string;
    private readonly localUsers = new Map<string, User>();
    private readonly localGames = new Map<string, Game>();
    private readonly userToGame = new Map<string, string>();
    private readonly userInstances = new Map<string, string>();

    constructor(redis: RedisClient, publisher: Publisher, matchmaker: Matchmaker, instanceId: string) {
        this.redis = redis;
        this.publisher = publisher;
        this.matchmaker = matchmaker;
        this.instanceId = instanceId;
        this.controlChannel = `instance:${this.instanceId}:control`;
        this.redis.sub.on("message", (channel, message) => this.dispatch(channel, message));
        this.redis.sub.subscribe(this.controlChannel);
    }

    addUser(user: User) {
        this.addHandler(user);
    }

    private addHandler(user: User) {
        user.onMessage(async (data) => {
            const msg = JSON.parse(data);

            if (msg.type === INIT_GAME) {
                user.id = msg.payload.userId;
                this.localUsers.set(user.id, user);
                this.userInstances.set(user.id, this.instanceId);

                const opponent = await this.matchmaker.findOrWait(user.id, this.instanceId);
                if (!opponent) {
                    return;
                }

                const gameId = uuidv4();
                await this.persistGameMeta(gameId, opponent.userId, user.id);
                this.userInstances.set(opponent.userId, opponent.instanceId);

                if (opponent.instanceId === this.instanceId) {
                    const waiter = this.localUsers.get(opponent.userId);
                    if (!waiter) {
                        return;
                    }
                    this.startLocalGame(gameId, opponent.userId, user.id, [waiter, user]);
                    return;
                }

                this.startLocalGame(gameId, opponent.userId, user.id, [user]);
                await this.redis.pub.publish(
                    `instance:${opponent.instanceId}:control`,
                    JSON.stringify({
                        type: "game_created",
                        gameId,
                        whiteId: opponent.userId,
                        blackId: user.id,
                        instanceId: this.instanceId,
                    })
                );
            } else if (msg.type === MOVE) {
                const gameId = this.userToGame.get(user.id);
                if (gameId) {
                    const game = this.localGames.get(gameId);
                    if (game) {
                        await game.makeMove(user, msg.payload);
                    }
                }
            }
        });

        user.onClose(() => {
            this.removeUser(user);
        });
    }

    private dispatch(channel: string, message: string) {
        if (channel === this.controlChannel) {
            this.onControlMessage(JSON.parse(message) as ControlMessage);
            return;
        }

        const prefix = "game:";
        const suffix = ":relay";
        if (channel.startsWith(prefix) && channel.endsWith(suffix)) {
            const gameId = channel.slice(prefix.length, channel.length - suffix.length);
            const game = this.localGames.get(gameId);
            if (game) {
                game.handleRelayMessage(message);
            }
        }
    }

    private onControlMessage(message: ControlMessage) {
        if (message.type === "game_created") {
            if (this.localGames.has(message.gameId)) {
                return;
            }
            const hasWhite = this.localUsers.has(message.whiteId);
            const hasBlack = this.localUsers.has(message.blackId);
            if (!hasWhite && !hasBlack) {
                return;
            }
            const localUserId = hasWhite ? message.whiteId : message.blackId;
            const localUser = this.localUsers.get(localUserId);
            if (!localUser) {
                return;
            }
            const remoteId = localUserId === message.whiteId ? message.blackId : message.whiteId;
            if (message.instanceId) {
                this.userInstances.set(remoteId, message.instanceId);
            }
            this.startLocalGame(message.gameId, message.whiteId, message.blackId, [localUser]);
        } else if (message.type === "game_over") {
            this.handleRemoteGameOver(message.gameId);
        }
    }

    private startLocalGame(gameId: string, whiteId: string, blackId: string, users: User[]) {
        const game = new Game(gameId, whiteId, blackId, this.redis, this.publisher, this.instanceId);
        this.localGames.set(gameId, game);
        this.redis.sub.subscribe(`game:${gameId}:relay`);
        for (const user of users) {
            this.userToGame.set(user.id, gameId);
            game.attach(user);
        }
    }

    private persistGameMeta(gameId: string, whiteId: string, blackId: string) {
        const meta: GameMeta = {
            id: gameId,
            whitePlayerId: whiteId,
            blackPlayerId: blackId,
            startAt: new Date(),
            status: GameStatus.IN_PROGRESS,
            timeControl: TimeControl.CLASSICAL,
        };
        return this.publisher.publishGameEvent(meta);
    }

    private async removeUser(user: User) {
        if (!user.id) {
            return;
        }
        this.localUsers.delete(user.id);
        this.userInstances.delete(user.id);

        const gameId = this.userToGame.get(user.id);
        if (gameId) {
            const game = this.localGames.get(gameId);
            if (game) {
                const remainingLocal = game.localPlayerOtherThan(user.id);
                if (remainingLocal) {
                    remainingLocal.send({ type: GAME_OVER, payload: { winner: null } });
                    remainingLocal.close();
                }
                const opponentId = game.opponentOf(user.id);
                this.destroyLocalGame(gameId);
                if (opponentId) {
                    const remote = this.userInstances.get(opponentId);
                    if (remote && remote !== this.instanceId) {
                        await this.redis.pub.publish(
                            `instance:${remote}:control`,
                            JSON.stringify({
                                type: "game_over",
                                gameId,
                            })
                        );
                    }
                }
            }
            this.userToGame.delete(user.id);
        } else {
            await this.matchmaker.release(user.id, this.instanceId);
        }
    }

    private handleRemoteGameOver(gameId: string) {
        const game = this.localGames.get(gameId);
        if (!game) {
            return;
        }
        for (const user of game.localPlayers()) {
            user.send({ type: GAME_OVER, payload: { winner: null } });
            user.close();
        }
        this.destroyLocalGame(gameId);
    }

    private destroyLocalGame(gameId: string) {
        const game = this.localGames.get(gameId);
        if (!game) {
            return;
        }
        for (const userId of game.localUserIds()) {
            this.userToGame.delete(userId);
        }
        this.redis.sub.unsubscribe(`game:${gameId}:relay`);
        this.localGames.delete(gameId);
    }
}