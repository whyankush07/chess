"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { type Square, type Move } from "chess.js";
import useChess from "@/hooks/useChess";
import ChessBoard from "@/components/chess-board";
import useSocket, { setMoveCallback } from "@/hooks/useSocket";
import { TbArrowsExchange } from "react-icons/tb";

export default function GamePage() {
  const searchParams = useSearchParams();
  const colorParam = searchParams.get("color");
  const [playerColor] = useState<"w" | "b">(
    colorParam === "b" ? "b" : "w"
  );
  const [manualFlip, setManualFlip] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const { socket } = useSocket();
  
  const skipSendRef = useRef(false);
  
  const onMove = useCallback((move: Move) => {
    if (skipSendRef.current) return;
    console.log("Move made:", move.san, move.from, "->", move.to);
    socket?.send(JSON.stringify({ type: "move", payload: { from: move.from, to: move.to } }));
  }, [socket]);
  
  const chess = useChess(undefined, onMove);

  const handleOpponentMove = useCallback((payload: { from: string; to: string }) => {
    skipSendRef.current = true;
    chess.makeMove(payload.from as Square, payload.to as Square);
    skipSendRef.current = false;
    setSelectedSquare(null);
    setValidMoves([]);
  }, [chess]);

  useEffect(() => {
    setMoveCallback(handleOpponentMove);
    return () => setMoveCallback(null);
  }, [handleOpponentMove]);


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

  const movePairs: { white: Move; black: Move | null }[] = [];
  for (let i = 0; i < chess.moveHistory.length; i += 2) {
    movePairs.push({
      white: chess.moveHistory[i]!,
      black: chess.moveHistory[i + 1] ?? null,
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center lg:items-start w-full max-w-[900px]">
        <div className="flex flex-col items-center gap-3 w-full max-w-[540px]">
          <div className="relative w-full flex items-center justify-center">
            <button
              onClick={() => setManualFlip((f) => !f)}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-md border border-neutral-300 bg-white hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Flip board"
            >
              <TbArrowsExchange className="text-neutral-600 text-lg" />
            </button>
            <div className="text-sm font-medium text-neutral-700">
              {chess.turn === "w" ? "White to move" : "Black to move"}
              {chess.isCheck && !chess.isGameOver && (
                <span className="ml-2 text-xs text-amber-500 font-semibold uppercase tracking-wider">
                  Check
                </span>
              )}
              {chess.isGameOver && (
                <span className="ml-2 text-xs font-semibold uppercase tracking-wider">
                  {chess.isCheckmate
                    ? chess.turn === "w"
                      ? "Black wins"
                      : "White wins"
                    : "Draw"}
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full">
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
              manualFlip={manualFlip}
              onSquareClick={handleSquareClick}
            />
          </div>
        </div>

        <div className="w-full lg:w-56 shrink-0">
          <div className="rounded-sm border border-neutral-300 bg-white">
            <div className="border-b border-neutral-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Moves
            </div>
            <div className="h-48 lg:h-80 overflow-y-auto p-2">
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
        </div>
      </div>
    </div>
  );
}
