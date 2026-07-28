"use client";

import { useState } from "react";
import { type Square } from "chess.js";
import useChess from "@/hooks/useChess";
import ChessBoard from "@/components/chess-board";
import { Button } from "@/components/ui/button";
import useSocket from "@/hooks/useSocket";
import { TbLoader4, TbArrowsExchange } from "react-icons/tb";
import { toast } from "sonner";

export default function GamePage() {
  const [playerColor] = useState<"w" | "b">("w");
  const [manualFlip, setManualFlip] = useState(false);
  const [selectedSquare,] = useState<Square | null>(null);
  const [validMoves,] = useState<Square[]>([]);
  const [starting, setStarting] = useState<boolean>(false);
  const { socket, openGame } = useSocket();

  const handleInitGame = () => {
    try {
      setStarting(true);
      openGame();

      toast.success("Game started! Waiting for an opponent...");
    } catch {
      toast.error("Failed to start a new game. Please try again.");
    }
  }

  const chess = useChess(undefined);

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

          <div className="relative">
            <button
              onClick={() => setManualFlip((f) => !f)}
              className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-md border border-neutral-300 bg-white hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Flip board"
            >
              <TbArrowsExchange className="text-neutral-600 text-lg" />
            </button>
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
            />
          </div>

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
        </div>

        <div className="flex w-56 flex-col gap-3 justify-center">

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              size="sm"
              className={"cursor-pointer"}
              onClick={() => {
                handleInitGame();
              }}
            >
              {starting ? <TbLoader4 className="animate-spin" /> : "New Game"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
