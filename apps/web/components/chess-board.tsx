"use client";

import { useMemo } from "react";
import { type Square } from "chess.js";
import { cn } from "@/lib/utils";

type Piece = {
  type: string;
  color: "w" | "b";
};

const PIECE_UNICODE: Record<string, Record<string, string>> = {
  w: {
    k: "\u2654",
    q: "\u2655",
    r: "\u2656",
    b: "\u2657",
    n: "\u2658",
    p: "\u2659",
  },
  b: {
    k: "\u265A",
    q: "\u265B",
    r: "\u265C",
    b: "\u265D",
    n: "\u265E",
    p: "\u265F",
  },
};

function parseFen(fen: string): (Piece | null)[][] {
  const rows = (fen.split(" ")[0] ?? "").split("/");
  return rows.map((row) => {
    const files: (Piece | null)[] = [];
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") {
        for (let i = 0; i < Number(ch); i++) files.push(null);
      } else {
        const color = ch === ch.toUpperCase() ? "w" : "b";
        files.push({ type: ch.toLowerCase(), color });
      }
    }
    return files;
  });
}

function squareName(rank: number, file: number): Square {
  return `${"abcdefgh"[file]}${8 - rank}` as Square;
}

interface ChessBoardProps {
  fen: string;
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  turn: "w" | "b";
  playerColor: "w" | "b";
  onSquareClick: (square: Square) => void;
}

export default function ChessBoard({
  fen,
  selectedSquare,
  validMoves,
  lastMove,
  isCheck,
  turn,
  playerColor,
  onSquareClick,
}: ChessBoardProps) {
  const flipped = playerColor === "b";

  const board = useMemo(() => parseFen(fen), [fen]);

  const validMoveSet = useMemo(() => new Set(validMoves), [validMoves]);

  const ranks = Array.from({ length: 8 }, (_, i) => i);
  const displayRanks = flipped ? [...ranks].reverse() : ranks;
  const displayFiles = flipped
    ? Array.from({ length: 8 }, (_, i) => 7 - i)
    : ranks;

  let kingSquare: Square | null = null;
  if (isCheck) {
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r]?.[f];
        if (piece && piece.type === "k" && piece.color === turn) {
          kingSquare = squareName(r, f);
        }
      }
    }
  }

  const SQUARE_SIZE = "h-[60px] w-[60px] text-[40px] sm:h-[67.5px] sm:w-[67.5px] sm:text-[44px]";

  return (
    <div className="select-none">
      <div className="flex">
        <div className="flex flex-col pr-1 text-[11px] font-medium text-neutral-500">
          {displayRanks.map((r) => (
            <div
              key={r}
              className={cn(
                "flex items-center justify-center",
                SQUARE_SIZE.split(" ").filter((s) => s.startsWith("h-") || s.startsWith("sm:h-")).join(" ")
              )}
            >
              {8 - r}
            </div>
          ))}
        </div>

        <div>
          <div className="grid grid-cols-8 grid-rows-8 border-2 border-neutral-800">
            {displayRanks.map((r) =>
              displayFiles.map((f) => {
                const piece = board[r]?.[f];
                const sq = squareName(r, f);
                const isLight = (r + f) % 2 === 0;
                const isSelected = selectedSquare === sq;
                const isValidMove = validMoveSet.has(sq);
                const isLastMove =
                  lastMove && (sq === lastMove.from || sq === lastMove.to);
                const isKingInCheck = kingSquare === sq;

                return (
                  <button
                    key={sq}
                    onClick={() => onSquareClick(sq)}
                    className={cn(
                      "relative flex items-center justify-center leading-none transition-colors cursor-pointer",
                      SQUARE_SIZE,
                      isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]",
                      isSelected && "bg-[#f7ec5a]!",
                      isLastMove &&
                        !isSelected &&
                        (isLight ? "bg-[#f7ec59cc]" : "bg-[#b58863cc]"),
                      isKingInCheck &&
                        "bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.6)_0%,rgba(255,0,0,0.3)_50%,transparent_70%)]",
                      isValidMove &&
                        !piece &&
                        "after:absolute after:h-3 after:w-3 after:rounded-full after:bg-black/20 after:content-[''] sm:after:h-3.5 sm:after:w-3.5",
                      isValidMove &&
                        !!piece &&
                        "after:absolute after:inset-0 after:rounded-full after:border-[3px] after:border-black/20 after:content-['']"
                    )}
                  >
                    {piece
                      ? PIECE_UNICODE[piece.color]?.[piece.type] ?? ""
                      : ""}
                  </button>
                );
              })
            )}
          </div>

          <div className="grid grid-cols-8">
            {displayFiles.map((f) => (
              <div
                key={f}
                className={cn(
                  "flex items-center justify-center text-[11px] font-medium text-neutral-500",
                  SQUARE_SIZE.split(" ").filter((s) => s.startsWith("w-") || s.startsWith("sm:w-")).join(" ")
                )}
              >
                {"abcdefgh"[f]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
