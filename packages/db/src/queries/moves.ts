import crypto from "crypto";
import db from "../index";
import { MOVE_EVENT } from "@repo/types/chess";
import { v4 as uuidv4 } from "uuid";

export const persistMove = async (move: MOVE_EVENT) => {
    const query = `
        INSERT INTO "Move" ("id", "gameId", "moveNumber", "notation", "startFen", "endFen", "timeTaken")
        VALUES ($1, $2, (SELECT COALESCE(MAX("moveNumber"), 0) + 1 FROM "Move" WHERE "gameId" = $2), $3, $4, $5, $6)
    `;
    const timeTaken = 0;
    const id = uuidv4();

    await db.client.query(query, [id, move.gameId, move.notation, move.startfen, move.endfen, timeTaken]);
};