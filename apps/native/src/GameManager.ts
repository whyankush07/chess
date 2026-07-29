import { Game } from "./Game";
import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE } from "@repo/types/message";
import { Publisher } from "./Publisher";

export class GameManager {
    private games: Game[];
    private pendingUser : WebSocket | null;
    private users : WebSocket[];
    private publisher : Publisher;

    constructor(publisher: Publisher) {
        this.publisher = publisher;
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket : WebSocket) {
        this.users.push(socket);
        console.log("User " + this.users.length + " connected");
        console.log("total games: ", this.games.length);
        this.addHandler(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter((user) => user !== socket);
        const gameIdx = this.games.findIndex((g) => g.whiteP === socket || g.blackP === socket);
        if (gameIdx !== -1) {
            const game = this.games[gameIdx];
            const opponent = game.whiteP === socket ? game.blackP : game.whiteP;
            opponent.send(JSON.stringify({ type: GAME_OVER, payload: { winner: null } }));
            opponent.close();
            this.games.splice(gameIdx, 1);
        }
        if (this.pendingUser === socket) {
            this.pendingUser = null;
        }
    }

    addHandler(socket : WebSocket) {
        socket.on("message" , (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type == INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser, socket, this.publisher);
                    this.pendingUser = null;
                    this.games.push(game);
                } else {
                    this.pendingUser = socket;
                }
            } else if (msg.type == MOVE) {
                console.log("move message received", msg.payload);
                console.log(this.users.length);
                const game = this.games.find((game) => game.whiteP === socket || game.blackP === socket);
                if (game) {
                    game.makeMove(socket, msg.payload);
                }
            }
        })
    }
}