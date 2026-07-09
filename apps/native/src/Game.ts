import { WebSocket } from "ws";
import { Chess } from "chess.js"
import { GAME_OVER, INFO, INIT_GAME, MOVE } from "./message";

export class Game {
    public whiteP: WebSocket;
    public blackP: WebSocket;
    private board: Chess;
    private startTime: Date;

    constructor(whiteP: WebSocket, blackP: WebSocket) {
        this.whiteP = whiteP;
        this.blackP = blackP;
        this.board = new Chess();
        this.startTime = new Date();
        this.whiteP.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "White"
            }
        }));
        this.blackP.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: "Black"
            }
        }));
    }

    makeMove(socket: WebSocket, move: {
        from: string,
        to: string
    }) {
        console.log("move recieved by the game manager");
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
        console.log("Move passed to the board")
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
        console.log("moved successfully at board");

        if (this.board.isGameOver()) {
            const winner = this.board.isCheckmate()
                ? (this.board.turn() === 'w' ? "Black" : "White")
                : null;
            const payload = { winner };
            this.whiteP.send(JSON.stringify({ type: GAME_OVER, payload }));
            this.blackP.send(JSON.stringify({ type: GAME_OVER, payload }));
            this.whiteP.close();
            this.blackP.close();
            return;
        }

        if (this.board.moves().length % 2 === 0) {
            console.log("White to move");
            this.blackP.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        } else {
            console.log("Black to move");
            this.whiteP.send(JSON.stringify({
                type: MOVE,
                payload: move
            }));
        }
    }
}