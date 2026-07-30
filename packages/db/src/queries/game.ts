import { Game } from "@repo/types/chess";
import { DB } from "../db";

export const createGame = async (db: DB, game: Game) => {
    const query = `
        INSERT INTO "Game" ("id", "whitePlayerId", "blackPlayerId", "status", "timeControl", "startAt") 
        VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const date = new Date();
    await db.client.query(query, [game.id, game.whitePlayerId, game.blackPlayerId, game.status, game.timeControl, game.startAt]);
};

export const getGameById = async (db: DB, gameId: string): Promise<Game | null> => {
    const query = `SELECT * FROM "Game" WHERE "id" = $1`;
    const result = await db.client.query(query, [gameId]);
    return result.rows[0] || null;
}