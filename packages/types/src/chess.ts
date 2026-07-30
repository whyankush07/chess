export interface MOVE_EVENT {
    gameId: string
    notation: string;
    startfen: string
    endfen: string;
}

export type PlayerType = "Black" | "White"