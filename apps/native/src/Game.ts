import { Chess } from "chess.js";
import { GAME_OVER, INFO, INIT_GAME, MOVE } from "@repo/types/message";
import { MovePayload } from "@repo/types/message";
import { MOVE_EVENT } from "@repo/types/chess";
import { Publisher } from "./Publisher";
import { RedisClient } from "./RedisClient";
import { User } from "./User";

interface RelayMove {
    kind: "move";
    move: { from: string; to: string; san: string; promotion?: string };
    winner: string | null;
    gameOver: boolean;
    originInstanceId: string;
}

export class Game {
    private readonly gameId: string;
    private readonly whiteId: string;
    private readonly blackId: string;
    private readonly board: Chess;
    private readonly localSockets = new Map<string, User>();
    private readonly redis: RedisClient;
    private readonly publisher: Publisher;
    private readonly instanceId: string;

    constructor(gameId: string, whiteId: string, blackId: string, redis: RedisClient, publisher: Publisher, instanceId: string) {
        this.gameId = gameId;
        this.whiteId = whiteId;
        this.blackId = blackId;
        this.redis = redis;
        this.publisher = publisher;
        this.instanceId = instanceId;
        this.board = new Chess();
    }

    attach(user: User) {
        this.localSockets.set(user.id, user);
        user.send({
            type: INIT_GAME,
            payload: {
                gameId: this.gameId,
                color: user.id === this.whiteId ? "White" : "Black",
                info: "White to move",
            },
        });
    }

    localPlayers(): User[] {
        return Array.from(this.localSockets.values());
    }

    localPlayerOtherThan(userId: string): User | undefined {
        for (const user of this.localSockets.values()) {
            if (user.id !== userId) {
                return user;
            }
        }
        return undefined;
    }

    localUserIds(): string[] {
        return Array.from(this.localSockets.keys());
    }

    opponentOf(userId: string): string | null {
        if (this.whiteId === userId) {
            return this.blackId;
        }
        if (this.blackId === userId) {
            return this.whiteId;
        }
        return null;
    }

    handleRelayMessage(raw: string) {
        const relay = JSON.parse(raw) as RelayMove;
        if (relay.originInstanceId === this.instanceId) {
            return;
        }

        try {
            this.board.move(relay.move);
        } catch {
            return;
        }

        for (const user of this.localSockets.values()) {
            user.send({ type: MOVE, payload: relay.move });
            if (relay.gameOver) {
                user.send({ type: GAME_OVER, payload: { winner: relay.winner } });
            }
        }
    }

    async makeMove(user: User, payload: MovePayload) {
        const isWhite = this.whiteId === user.id;
        const isBlack = this.blackId === user.id;
        if (!isWhite && !isBlack) {
            return;
        }

        if ((this.board.turn() === "w" && !isWhite) || (this.board.turn() === "b" && !isBlack)) {
            user.send({ type: INFO, payload: { info: this.board.turn() === "w" ? "White to move" : "Black to move" } });
            return;
        }

        const startFEN = this.board.fen();
        try {
            this.board.move(payload);
        } catch (err) {
            user.send({ type: INFO, payload: { info: `${err}` } });
            return;
        }
        const endFEN = this.board.fen();

        const gameOver = this.board.isGameOver();
        const winner = gameOver && this.board.isCheckmate() ? (this.board.turn() === "w" ? "Black" : "White") : null;

        const relay: RelayMove = {
            kind: "move",
            move: { from: payload.from, to: payload.to, san: payload.san, promotion: payload.promotion },
            winner,
            gameOver,
            originInstanceId: this.instanceId,
        };

        // send move to pub-sub for game viewers
        // also send the move to stream for game history
        await this.redis.pub.publish(`game:${this.gameId}:relay`, JSON.stringify(relay));
        await this.publisher.publishMoveEvent({
            gameId: this.gameId,
            notation: payload.san,
            startfen: startFEN,
            endfen: endFEN,
        } as MOVE_EVENT);

        for (const local of this.localSockets.values()) {
            if (local.id === user.id) {
                continue;
            }
            local.send({ type: MOVE, payload: relay.move });
            if (gameOver) {
                local.send({ type: GAME_OVER, payload: { winner } });
            }
        }
        if (gameOver) {
            user.send({ type: GAME_OVER, payload: { winner } });
        }
    }
}