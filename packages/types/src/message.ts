export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const INFO = "info"

export interface MovePayload {
    from: string;
    to: string;
    promotion?: string;
    san: string;
}