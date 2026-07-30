import db from "../index";
import { MOVE_EVENT } from "@repo/types/chess";

export const persistMove = async (move: MOVE_EVENT) => {
    const query = `
        INSERT INTO moves ("gameId", "moveNumber", "notation", "startFen", "endFen", "timeTaken")
        VALUES ($1, (SELECT COALESCE(MAX("moveNumber"), 0) + 1 FROM moves WHERE "gameId" = $1), $2, $3, $4, $5)
    `;
    const timeTaken = 0;

    await db.client.query(query, [move.gameId, move.notation, move.startfen, move.endfen, timeTaken]);
};