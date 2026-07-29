export interface MOVE_EVENT {
    gameId: string
    from: string;
    to: string;
    player: PlayerType;
    promotion?: string
}

export type PlayerType = "Black" | "White"