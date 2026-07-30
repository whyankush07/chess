"use client";

import { useState, useCallback, useRef } from "react";
import { Chess, type Square, type Move } from "chess.js";

export interface ChessState {
  fen: string;
  turn: "w" | "b";
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  moveHistory: Move[];
  lastMove: Move | null;
}

export interface UseChessReturn extends ChessState {
  makeMove: (from: Square, to: Square, promotion?: string) => Move | null;
  makeMoveNotation: (notation: string) => Move | null;
  getLegalMoves: (square: Square) => Square[];
  reset: () => void;
  loadFen: (fen: string) => boolean;
  getPiece: (square: Square) => ReturnType<Chess["get"]>;
}

export default function useChess(
  initialFen?: string,
  onMove?: (move: Move) => void
): UseChessReturn {
  const gameRef = useRef(new Chess(initialFen));

  const deriveState = useCallback((game: Chess): ChessState => {
    return {
      fen: game.fen(),
      turn: game.turn(),
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isStalemate: game.isStalemate(),
      isDraw: game.isDraw(),
      isGameOver: game.isGameOver(),
      isThreefoldRepetition: game.isThreefoldRepetition(),
      isInsufficientMaterial: game.isInsufficientMaterial(),
      moveHistory: game.history({ verbose: true }),
      lastMove: game.history({ verbose: true }).at(-1) ?? null,
    };
  }, []);

  const [state, setState] = useState<ChessState>(() =>
    deriveState(gameRef.current)
  );

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      const game = gameRef.current;
      try {
        const move = game.move({ from, to, promotion: promotion ?? "q" });
        if (move) {
          setState(deriveState(game));
          onMove?.(move);
          return move;
        }
        return null;
      } catch {
        return null;
      }
    },
    [deriveState, onMove]
  );

  const makeMoveNotation = useCallback(
    (notation: string) => {
      const game = gameRef.current;
      try {
        const move = game.move(notation);
        if (move) {
          setState(deriveState(game));
          onMove?.(move);
          return move;
        }
        return null;
      } catch {
        return null;
      }
    },
    [deriveState, onMove]
  );

  const getLegalMoves = useCallback((square: Square): Square[] => {
    const moves = gameRef.current.moves({ square, verbose: true });
    return moves.map((m) => m.to as Square);
  }, []);

  const reset = useCallback(() => {
    const game = gameRef.current;
    game.reset();
    setState(deriveState(game));
  }, [deriveState]);

  const loadFen = useCallback(
    (fen: string) => {
      const game = gameRef.current;
      try {
        game.load(fen);
        setState(deriveState(game));
        return true;
      } catch {
        return false;
      }
    },
    [deriveState]
  );

  const getPiece = useCallback((square: Square) => {
    return gameRef.current.get(square);
  }, []);

  return {
    ...state,
    makeMove,
    makeMoveNotation,
    getLegalMoves,
    reset,
    loadFen,
    getPiece,
  };
}
