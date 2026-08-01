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

export const TimeControl = {
    CLASSICAL: "CLASSICAL",
    RAPID: "RAPID",
    BLITZ: "BLITZ",
    BULLET: "BULLET",
} as const;

export type TimeControl = (typeof TimeControl)[keyof typeof TimeControl];

export const GameStatus = {
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    ABANDONED: "ABANDONED",
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export interface User {
    id?: string;
    username: string;
    email: string;
    password: string;
    rating?: number;
}