export interface MOVE_EVENT {
    gameId: string
    notation: string;
    startfen: string
    endfen: string;
}

export type PlayerType = "Black" | "White"

export interface Game {
    id: string;
    whitePlayerId: string;
    blackPlayerId: string;
    status?: GameStatus;
    result?: "white" | "black" | "draw" | null;
    timeControl: TimeControl;
    startingFen?: string;
    currentFen?: string;
    startAt: Date;
    endAt?: Date | null;
    opening?: string | null;
    event?: string | null;
}

export enum TimeControl { 'CLASSICAL', 'RAPID', 'BLITZ', 'BULLET' };
export enum GameStatus { 'IN_PROGRESS', 'COMPLETED', 'ABANDONED' };

export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    rating?: number;
}