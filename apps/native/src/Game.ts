import { Chess } from "chess.js"
import { GAME_OVER, INFO, INIT_GAME, MOVE } from "@repo/types/message";
import { v4 as uuidv4 } from 'uuid';
import { Publisher } from "./Publisher";
import { MOVE_EVENT, Game as New_Game, TimeControl, GameStatus } from "@repo/types/chess";
import { User } from "./User";

export class Game {
    private gameId: string;
    public whiteP: User;
    public blackP: User;
    private board: Chess;
    private startTime: Date;
    private publisher: Publisher;

    constructor(whiteP: User, blackP: User, publisher: Publisher) {
        this.publisher = publisher;
        this.gameId = uuidv4();
        this.whiteP = whiteP;
        this.blackP = blackP;
        this.board = new Chess();
        this.startTime = new Date();

        this.whiteP.send({
            type: INIT_GAME,
            payload: {
                gameId: this.gameId,
                color: "White",
                info: "White to move"
            }
        });

        this.blackP.send({
            type: INIT_GAME,
            payload: {
                gameId: this.gameId,
                color: "Black",
                info: "White to move"
            }
        });

        console.log("Game created with ID: " + this.gameId);

        const gameData: New_Game = {
            id: this.gameId,
            whitePlayerId: this.whiteP.id,
            blackPlayerId: this.blackP.id,
            startAt: this.startTime,
            status: GameStatus.IN_PROGRESS,
            timeControl: TimeControl.CLASSICAL,
        };
        this.publisher.publishGameEvent(gameData);
    }

    makeMove(user: User, move: {
        from: string,
        to: string,
        san: string
    }) {
        if (this.board.turn() === 'w' && user !== this.whiteP) {
            this.blackP.send({
                type: INFO,
                payload: {
                    info: "White to move"
                }
            });
            return;
        }

        if (this.board.turn() === 'b' && user !== this.blackP) {
            this.whiteP.send({
                type: INFO,
                payload: {
                    info: "Black to move"
                }
            });
            return;
        }

        const startFEN = this.board.fen();
        try {
            this.board.move(move);
        } catch (err) {
            console.warn(`${err}`);
            user.send({
                type: INFO,
                payload: {
                    info: `${err}`
                }
            });
            return;
        }
        const endFEN = this.board.fen();

        if (this.board.isGameOver()) {
            const winner = this.board.isCheckmate()
                ? (this.board.turn() === 'w' ? "Black" : "White")
                : null;
            const payload = { winner };
            this.whiteP.send({ type: GAME_OVER, payload });
            this.blackP.send({ type: GAME_OVER, payload });
        }

        const opponent = user === this.whiteP ? this.blackP : this.whiteP;
        opponent.send({
            type: MOVE,
            payload: move
        });

        const move_event: MOVE_EVENT = {
            gameId: this.gameId,
            notation: move.san,
            startfen: startFEN,
            endfen: endFEN
        }
        this.publisher.publishMoveEvent(move_event);
    }
}
