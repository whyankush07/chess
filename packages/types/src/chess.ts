export interface MOVE_EVENT {
    gameId: string
    notation: string;
    startfen: string
    endfen: string;
}

export type PlayerType = "Black" | "White"

export interface Game {
    whitePlayerId: string;
    blackPlayerId: string;
    status: "ongoing" | "finished";
    result: "white" | "black" | "draw" | null;
    timeControl: TimeControl;
    startingFen: string;
    currentFen: string;
    startAt: Date;
    endAt: Date | null;
    opening: string | null;
    event: string | null;
}

export enum TimeControl { 'CLASSICAL', 'RAPID', 'BLITZ', 'BULLET' };