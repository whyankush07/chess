import React, { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import type { Square } from "chess.js";

type Piece = {
  type: string;
  color: "w" | "b";
};

export const PIECE_UNICODE: Record<string, Record<string, string>> = {
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

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function parseFen(fen?: string): (Piece | null)[][] {
  const trimmed =
    fen && fen.trim() ? fen.trim().split(" ")[0]! : DEFAULT_FEN.split(" ")[0]!;
  const rawRows = trimmed.split("/");
  const rows =
    rawRows.length === 8 ? rawRows : DEFAULT_FEN.split(" ")[0]!.split("/");
  return rows.map((row) => {
    const files: (Piece | null)[] = [];
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") {
        for (let i = 0; i < Number(ch); i++) files.push(null);
      } else {
        const color: "w" | "b" = ch === ch.toUpperCase() ? "w" : "b";
        files.push({ type: ch.toLowerCase(), color });
      }
    }
    return files;
  });
}

function squareName(rank: number, file: number): Square {
  return `${"abcdefgh"[file]}${8 - rank}` as Square;
}

export interface ChessBoardProps {
  fen: string;
  selectedSquare: Square | null;
  validMoves: Square[];
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  turn: "w" | "b";
  playerColor: "w" | "b";
  manualFlip?: boolean;
  onSquareClick?: (square: Square) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  selectedSquare,
  validMoves,
  lastMove,
  isCheck,
  turn,
  playerColor,
  manualFlip = false,
  onSquareClick,
}) => {
  const { width: windowWidth } = useWindowDimensions();

  const flipped = (playerColor === "b") !== manualFlip;

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

  const boardPadding = 16;
  const maxBoardContainer = Math.min(windowWidth - boardPadding * 2, 400);
  const coordWidth = 18;
  const squareSize = Math.floor((maxBoardContainer - coordWidth - 4) / 8);
  const boardSize = squareSize * 8;
  const pieceFontSize = Math.round(squareSize * 0.72);

  return (
    <View style={styles.container}>
      <View style={styles.boardWrapper}>
        {/* Left rank labels: exactly as in web */}
        <View style={[styles.rankColumn, { width: coordWidth }]}>
          {displayRanks.map((r) => (
            <View
              key={r}
              style={[styles.coordRankCell, { height: squareSize }]}
            >
              <Text style={styles.coordText}>{8 - r}</Text>
            </View>
          ))}
        </View>

        {/* Board grid and bottom file labels */}
        <View style={styles.boardColumn}>
          <View
            style={[
              styles.grid,
              { width: boardSize + 4, height: boardSize + 4 },
            ]}
          >
            {displayRanks.map((r) => (
              <View key={r} style={[styles.row, { height: squareSize }]}>
                {displayFiles.map((f) => {
                  const piece = board[r]?.[f];
                  const sq = squareName(r, f);
                  const isLight = (r + f) % 2 === 0;
                  const isSelected = selectedSquare === sq;
                  const isValidMove = validMoveSet.has(sq);
                  const isLastMove =
                    lastMove && (sq === lastMove.from || sq === lastMove.to);
                  const isKingInCheck = kingSquare === sq;

                  let squareBg = isLight ? "#f0d9b5" : "#b58863";
                  if (isSelected) {
                    squareBg = "#f7ec5a";
                  } else if (isLastMove) {
                    squareBg = isLight
                      ? "rgba(247, 236, 89, 0.8)"
                      : "rgba(181, 136, 99, 0.8)";
                  } else if (isKingInCheck) {
                    squareBg = "rgba(239, 68, 68, 0.65)";
                  }

                  return (
                    <Pressable
                      key={sq}
                      onPress={() => onSquareClick?.(sq)}
                      style={[
                        styles.square,
                        {
                          width: squareSize,
                          height: squareSize,
                          backgroundColor: squareBg,
                        },
                      ]}
                    >
                      {piece && (
                        <Text
                          style={[
                            styles.pieceText,
                            {
                              fontSize: pieceFontSize,
                              lineHeight: squareSize,
                            },
                          ]}
                        >
                          {PIECE_UNICODE[piece.color]?.[piece.type] ?? ""}
                        </Text>
                      )}

                      {isValidMove && !piece && (
                        <View
                          style={[
                            styles.validMoveDot,
                            {
                              width: Math.floor(squareSize * 0.3),
                              height: Math.floor(squareSize * 0.3),
                              borderRadius: Math.floor(squareSize * 0.15),
                            },
                          ]}
                        />
                      )}

                      {isValidMove && !!piece && (
                        <View
                          style={[
                            styles.validMoveCaptureRing,
                            {
                              width: Math.floor(squareSize * 0.8),
                              height: Math.floor(squareSize * 0.8),
                              borderRadius: Math.floor(squareSize * 0.4),
                            },
                          ]}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Bottom file labels: exactly as in web */}
          <View style={[styles.fileRow, { width: boardSize + 4 }]}>
            {displayFiles.map((f) => (
              <View
                key={f}
                style={[styles.coordFileCell, { width: squareSize }]}
              >
                <Text style={styles.coordText}>{"abcdefgh"[f]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  boardWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rankColumn: {
    flexDirection: "column",
    marginTop: 2,
  },
  coordRankCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  coordText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#737373",
  },
  boardColumn: {
    flexDirection: "column",
  },
  grid: {
    borderWidth: 2,
    borderColor: "#262626",
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    width: "100%",
  },
  square: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pieceText: {
    color: "#171717",
    textAlign: "center",
    includeFontPadding: false,
  },
  validMoveDot: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  validMoveCaptureRing: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  fileRow: {
    flexDirection: "row",
    paddingTop: 2,
    paddingLeft: 2,
  },
  coordFileCell: {
    alignItems: "center",
    justifyContent: "center",
  },
});
