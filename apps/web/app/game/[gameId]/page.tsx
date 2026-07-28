"use client";

import { useState, useCallback } from "react";
import { type Square, type Move } from "chess.js";
import useChess from "@/hooks/useChess";
import ChessBoard from "@/components/chess-board";
import { Button } from "@/components/ui/button";
import useSocket from "@/hooks/useSocket";

export default function GamePage() {
  const [playerColor] = useState<"w" | "b">("w");
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [starting, setStarting] = useState<boolean>(false);
  const socket = useSocket();

  const onMove = useCallback((move: Move) => {
    // TODO: send move over socket
    console.log("Move made:", move.san, move.from, "->", move.to);
    socket?.send(JSON.stringify({ type: "move", payload: { from: move.from, to: move.to } }));
  }, [socket]);

  const chess = useChess(undefined, onMove);

  const handleSquareClick = useCallback(
    (square: Square) => {
      if (chess.isGameOver) return;

      const piece = chess.getPiece(square);

      if (selectedSquare) {
        if (piece && piece.color === playerColor) {
          if (square === selectedSquare) {
            setSelectedSquare(null);
            setValidMoves([]);
          } else {
            setSelectedSquare(square);
            setValidMoves(chess.getLegalMoves(square));
          }
          return;
        }

        const move = chess.makeMove(selectedSquare, square);
        if (move) {
          setSelectedSquare(null);
          setValidMoves([]);
          return;
        }

        if (piece && piece.color === playerColor) {
          setSelectedSquare(square);
          setValidMoves(chess.getLegalMoves(square));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
        return;
      }

      if (piece && piece.color === playerColor && chess.turn === playerColor) {
        setSelectedSquare(square);
        setValidMoves(chess.getLegalMoves(square));
      }
    },
    [chess, selectedSquare, playerColor]
  );

  const statusText = (() => {
    if (chess.isCheckmate) {
      const winner = chess.turn === "w" ? "Black" : "White";
      return `Checkmate — ${winner} wins`;
    }
    if (chess.isStalemate) return "Stalemate — Draw";
    if (chess.isThreefoldRepetition) return "Draw by repetition";
    if (chess.isInsufficientMaterial) return "Draw — insufficient material";
    if (chess.isDraw) return "Draw";
    if (chess.isCheck) {
      return chess.turn === "w" ? "White is in check" : "Black is in check";
    }
    return chess.turn === "w" ? "White to move" : "Black to move";
  })();

  const movePairs: { white: Move; black: Move | null }[] = [];
  for (let i = 0; i < chess.moveHistory.length; i += 2) {
    movePairs.push({
      white: chess.moveHistory[i]!,
      black: chess.moveHistory[i + 1] ?? null,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full items-center justify-between rounded-sm bg-neutral-800 px-3 py-2 text-sm text-neutral-200">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-neutral-400 border border-neutral-600" />
              <span className="font-medium">
                {playerColor === "w" ? "White" : "Black"}
              </span>
            </div>
            {chess.isCheck && !chess.isGameOver && (
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Check
              </span>
            )}
          </div>

          <ChessBoard
            fen={chess.fen}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={chess.lastMove
              ? { from: chess.lastMove.from, to: chess.lastMove.to }
              : null}
            isCheck={chess.isCheck}
            turn={chess.turn}
            playerColor={playerColor}
            onSquareClick={handleSquareClick}
          />

          <div className="flex w-full items-center justify-between rounded-sm bg-neutral-800 px-3 py-2 text-sm text-neutral-200">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-neutral-900 border border-neutral-600" />
              <span className="font-medium">
                {playerColor === "w" ? "Black" : "White"}
              </span>
            </div>
            {chess.isGameOver && (
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                {chess.isCheckmate
                  ? chess.turn === "w"
                    ? "Black wins"
                    : "White wins"
                  : "Draw"}
              </span>
            )}
          </div>

          <div className="mt-1 w-full rounded-sm border border-neutral-300 bg-white px-3 py-2 text-center text-sm font-medium text-neutral-700">
            {statusText}
          </div>
        </div>

        <div className="flex w-56 flex-col gap-3">
          <div className="rounded-sm border border-neutral-300 bg-white">
            <div className="border-b border-neutral-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Moves
            </div>
            <div className="h-80 overflow-y-auto p-2">
              {movePairs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                  No moves yet
                </div>
              ) : (
                <table className="w-full text-xs">
                  <tbody>
                    {movePairs.map((pair, i) => (
                      <tr
                        key={i}
                        className={
                          chess.moveHistory.length - (i * 2 + 1) <= 2
                            ? "bg-amber-50"
                            : ""
                        }
                      >
                        <td className="w-6 py-0.5 pr-1 text-right font-mono text-neutral-400">
                          {i + 1}.
                        </td>
                        <td className="py-0.5 pl-1 font-mono text-neutral-800">
                          {pair.white.san}
                        </td>
                        <td className="py-0.5 pl-1 font-mono text-neutral-800">
                          {pair.black?.san ?? ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                chess.reset();
                setSelectedSquare(null);
                setValidMoves([]);
                setStarting(true);
                socket?.send(JSON.stringify({ type: "init_game" }));
              }}
            >
              {starting ? "Starting..." : "New Game"}
            </Button>
          </div>

          <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-2 text-[11px] leading-relaxed text-neutral-500">
            <span className="font-mono text-[10px]">{chess.fen}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
