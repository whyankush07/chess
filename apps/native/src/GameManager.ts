import { Game } from "./Game";
import { GAME_OVER, INIT_GAME, MOVE } from "@repo/types/message";
import { Publisher } from "./Publisher";
import { User } from "./User";

export class GameManager {
    private games: Game[];
    private pendingUser: User | null;
    private users: User[];
    private publisher: Publisher;

    constructor(publisher: Publisher) {
        this.publisher = publisher;
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(user: User) {
        this.users.push(user);
        this.addHandler(user);
    }

    removeUser(user: User) {
        this.users = this.users.filter((u) => u !== user);
        const gameIdx = this.games.findIndex((g) => g.whiteP === user || g.blackP === user);
        if (gameIdx !== -1) {
            const game = this.games[gameIdx];
            const opponent = game.whiteP === user ? game.blackP : game.whiteP;
            opponent.send({ type: GAME_OVER, payload: { winner: null } });
            opponent.close();
            this.games.splice(gameIdx, 1);
        }
        if (this.pendingUser === user) {
            this.pendingUser = null;
        }
    }

    private addHandler(user: User) {
        user.onMessage((data) => {
            const msg = JSON.parse(data);
            if (msg.type === INIT_GAME) {
                user.id = msg.payload.userId;
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser, user, this.publisher);
                    this.pendingUser = null;
                    this.games.push(game);
                } else {
                    this.pendingUser = user;
                }
            } else if (msg.type === MOVE) {
                const game = this.games.find((g) => g.whiteP === user || g.blackP === user);
                if (game) {
                    game.makeMove(user, msg.payload);
                }
            }
        });

        user.onClose(() => {
            this.removeUser(user);
        });
    }
}
