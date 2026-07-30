import { User } from "@repo/types/chess";
import { DB } from "../db";
import { v4 as uuidv4 } from "uuid";

export const saveUser = async (db: DB, user: User) => {
    const query = `'
        INSERT INTO "User" ("id", "username", "email", "password", "rating", "createdAt", "lastLoginAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

    const userId = uuidv4();
    const date = new Date();
    await db.client.query(query, [userId, user.username, user.email, user.password, user.rating ?? 100, date, date]);
};

export const getUserPasswordByEmail = async (db: DB, email: string): Promise<string | null> => {
    const query = `SELECT "password" FROM "User" WHERE "email" = $1`;
    const result = await db.client.query(query, [email]);
    return result.rows[0]?.password || null;
}

export const getUserById = async (db: DB, userId: string): Promise<User | null> => {
    const query = `SELECT * FROM "User" WHERE "id" = $1`;
    const result = await db.client.query(query, [userId]);
    return result.rows[0] || null;
};

export const getUserByEmail = async (db: DB, email: string): Promise<User | null> => {
    const query = `SELECT * FROM "User" WHERE "email" = $1`;
    const result = await db.client.query(query, [email]);
    return result.rows[0] || null;
};

export const getUserByUsername = async (db: DB, username: string): Promise<User | null> => {
    const query = `SELECT * FROM "User" WHERE "username" = $1`;
    const result = await db.client.query(query, [username]);
    return result.rows[0] || null;
}

export const updateUserRating = async (db: DB, userId: string, newRating: number): Promise<void> => {
    const query = `UPDATE "User" SET "rating" = $1 WHERE "id" = $2`;
    await db.client.query(query, [newRating, userId]);
}

export const updateUserLastLogin = async (db: DB, userId: string): Promise<void> => {
    const query = `UPDATE "User" SET "lastLoginAt" = $1 WHERE "id" = $2`;
    const date = new Date();
    await db.client.query(query, [date, userId]);
}