import { WebSocket } from "ws";
import { Chess } from "chess.js"
import { GAME_OVER, INFO, INIT_GAME, MOVE } from "@repo/types/message";
import { v4 as uuidv4 } from 'uuid';
import { Publisher } from "./Publisher";
import { MOVE_EVENT } from "@repo/types/chess";

export class Game {
    private gameId: string;
    public whiteP: WebSocket;
    public blackP: WebSocket;
    private board: Chess;
    private startTime: Date;
    private publisher : Publisher;

    constructor(whiteP: WebSocket, blackP: WebSocket, publisher: Publisher) {
        this.publisher = publisher;
        this.gameId = uuidv4();
        this.whiteP = whiteP;
        this.blackP = blackP;
        this.board = new Chess();
        this.startTime = new Date();
        this.whiteP.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                gameId: this.gameId,
                color: "White",
                info: "White to move"
            }
        }));
        this.blackP.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                gameId: this.gameId,
                color: "Black",
                info: "White to move"
            }
        }));
        console.log("Game created with ID: " + this.gameId);
        // todo: push this data to the queue for the handler worker to update the database
        
    }

    makeMove(socket: WebSocket, move: {
        from: string,
        to: string,
        san: string
    }) {
        if (this.board.turn() === 'w' && socket != this.whiteP) {
            this.blackP.send(JSON.stringify({
                type: INFO,
                payload: {
                    info: "White to move"
                }
            }))
            return;
        }  
        if (this.board.turn() === 'b' && socket != this.blackP) {
            this.whiteP.send(JSON.stringify({
                type: INFO,
                payload: {
                    info: "Black to move"
                }
            }))
            return;
        }
        const startFEN = this.board.fen();
        try {
            this.board.move(move);
        } catch (err) {
            console.warn(`${err}`);
            socket.send(JSON.stringify({
                type: INFO,
                payload: {
                    info: `${err}`
                }
            }));
            return;
        }
        const endFEN = this.board.fen();

        if (this.board.isGameOver()) {
            const winner = this.board.isCheckmate()
                ? (this.board.turn() === 'w' ? "Black" : "White")
                : null;
            const payload = { winner };
            this.whiteP.send(JSON.stringify({ type: GAME_OVER, payload }));
            this.blackP.send(JSON.stringify({ type: GAME_OVER, payload }));
        }

        const opponent = socket === this.whiteP ? this.blackP : this.whiteP;
        opponent.send(JSON.stringify({
            type: MOVE,
            payload: move
        }));

        const move_event: MOVE_EVENT = {
            gameId: this.gameId,
            notation: move.san,
            startfen: startFEN,
            endfen: endFEN
        }
        this.publisher.publishMoveEvent(move_event);
    }
}