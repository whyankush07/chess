import React, { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import type { Square } from "chess.js";
import { SvgXml } from "react-native-svg";
import { PIECE_SVGS } from "../constants/piecesSvg";

type Piece = {
  type: string;
  color: "w" | "b";
};

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function parseFen(fen?: string): (Piece | null)[][] {
  const target =
    fen && fen.trim()
      ? fen.trim().split(" ")[0]!
      : DEFAULT_FEN.split(" ")[0]!;
  const rows = target.split("/");
  return rows.map((row) => {
    const files: (Piece | null)[] = [];
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") {
        for (let i = 0; i < Number(ch); i++) {
          files.push(null);
        }
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

interface ChessBoardProps {
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
  const availableWidth = Math.min(windowWidth - boardPadding * 2, 400);
  const squareSize = Math.floor(availableWidth / 8);
  const boardSize = squareSize * 8;
  const pieceSize = Math.floor(squareSize * 0.88);

  const lightColor = "#eeeed2";
  const darkColor = "#769656";
  const lightLastMove = "#f7ec59";
  const darkLastMove = "#baca44";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.boardFrame,
          { width: boardSize, height: boardSize },
        ]}
      >
        {displayRanks.map((r, rowIndex) => (
          <View key={r} style={[styles.row, { height: squareSize }]}>
            {displayFiles.map((f, colIndex) => {
              const piece = board[r]?.[f];
              const sq = squareName(r, f);
              const isLight = (r + f) % 2 === 0;
              const isSelected = selectedSquare === sq;
              const isValidMove = validMoveSet.has(sq);
              const isLastMove =
                lastMove && (sq === lastMove.from || sq === lastMove.to);
              const isKingInCheck = kingSquare === sq;

              let squareBg = isLight ? lightColor : darkColor;
              if (isSelected) {
                squareBg = "#f7ec5a";
              } else if (isLastMove) {
                squareBg = isLight ? lightLastMove : darkLastMove;
              } else if (isKingInCheck) {
                squareBg = "rgba(239, 68, 68, 0.7)";
              }

              const showRankLabel = colIndex === 0;
              const showFileLabel = rowIndex === 7;
              const labelColor = isLight ? darkColor : lightColor;

              const pieceSvg =
                piece && PIECE_SVGS[piece.color]?.[piece.type]
                  ? PIECE_SVGS[piece.color][piece.type]
                  : null;

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
                  {showRankLabel && (
                    <Text
                      style={[
                        styles.coordRank,
                        { color: labelColor },
                      ]}
                    >
                      {8 - r}
                    </Text>
                  )}

                  {showFileLabel && (
                    <Text
                      style={[
                        styles.coordFile,
                        { color: labelColor },
                      ]}
                    >
                      {"abcdefgh"[f]}
                    </Text>
                  )}

                  {pieceSvg && (
                    <SvgXml
                      xml={pieceSvg}
                      width={pieceSize}
                      height={pieceSize}
                    />
                  )}

                  {isValidMove && !piece && (
                    <View
                      style={[
                        styles.validMoveDot,
                        {
                          width: Math.floor(squareSize * 0.32),
                          height: Math.floor(squareSize * 0.32),
                          borderRadius: Math.floor(squareSize * 0.16),
                        },
                      ]}
                    />
                  )}

                  {isValidMove && !!piece && (
                    <View
                      style={[
                        styles.validMoveCaptureRing,
                        {
                          width: squareSize - 4,
                          height: squareSize - 4,
                          borderRadius: (squareSize - 4) / 2,
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  boardFrame: {
    borderRadius: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#4d6438",
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
  coordRank: {
    position: "absolute",
    top: 2,
    left: 3,
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.85,
  },
  coordFile: {
    position: "absolute",
    bottom: 2,
    right: 3,
    fontSize: 10,
    fontWeight: "700",
    opacity: 0.85,
  },
  validMoveDot: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  validMoveCaptureRing: {
    position: "absolute",
    borderWidth: 4,
    borderColor: "rgba(0, 0, 0, 0.25)",
  },
});
