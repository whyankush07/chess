import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { Square, Move } from "chess.js";
import type { MovePayload } from "@repo/types/message";
import type { AppNavigationProp, GameRouteProp } from "../types/navigation";
import { ChessBoard } from "../components/ChessBoard";
import { PlayerBadge } from "../components/PlayerBadge";
import { MoveHistory } from "../components/MoveHistory";
import { Button } from "../components/Button";
import { colors } from "../constants/colors";
import { toast } from "../components/Toast";
import useChess from "../hooks/useChess";
import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";

export const GameScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<GameRouteProp>();
  const { color } = route.params;

  const playerColor: "w" | "b" = color === "b" ? "b" : "w";
  const [manualFlip, setManualFlip] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [gameOverResult, setGameOverResult] = useState<string | null>(null);

  const { sendMove, onMove: socketOnMove, onGameOver, onInfo } = useSocket();
  const { user } = useAuth();

  const skipSendRef = useRef(false);

  const onLocalMove = useCallback(
    (move: Move) => {
      if (skipSendRef.current) return;
      sendMove({
        from: move.from,
        to: move.to,
        san: move.san,
      });
    },
    [sendMove]
  );

  const chess = useChess(undefined, onLocalMove);

  const handleOpponentMove = useCallback(
    (payload: MovePayload) => {
      skipSendRef.current = true;
      chess.makeMove(
        payload.from as Square,
        payload.to as Square,
        payload.promotion
      );
      skipSendRef.current = false;
      setSelectedSquare(null);
      setValidMoves([]);
    },
    [chess]
  );

  useEffect(() => {
    const unsubMove = socketOnMove(handleOpponentMove);
    const unsubGameOver = onGameOver((payload) => {
      const winner = payload.winner;
      if (winner) {
        setGameOverResult(`${winner} wins`);
      } else {
        setGameOverResult("Game Over");
      }
    });
    const unsubInfo = onInfo((payload) => {
      toast.info(payload.info);
    });

    return () => {
      unsubMove();
      unsubGameOver();
      unsubInfo();
    };
  }, [socketOnMove, handleOpponentMove, onGameOver, onInfo]);

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

  const isFlipped = (playerColor === "b") !== manualFlip;
  const topColor: "w" | "b" = isFlipped ? "w" : "b";
  const bottomColor: "w" | "b" = isFlipped ? "b" : "w";

  const topLabel =
    topColor === playerColor ? (user?.username || "You") : "Opponent";
  const bottomLabel =
    bottomColor === playerColor ? (user?.username || "You") : "Opponent";

  let statusText = chess.turn === "w" ? "White to move" : "Black to move";
  if (chess.isGameOver || gameOverResult) {
    if (chess.isCheckmate) {
      statusText = chess.turn === "w" ? "Black wins" : "White wins";
    } else if (chess.isDraw) {
      statusText = "Draw";
    } else if (gameOverResult) {
      statusText = gameOverResult;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.navigate("GameLobby")}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>{"\u2190"}</Text>
            <Text style={styles.backText}>Lobby</Text>
          </Pressable>

          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>{statusText}</Text>
            {chess.isCheck && !chess.isGameOver && (
              <Text style={styles.checkBadge}>CHECK</Text>
            )}
          </View>

          <Pressable
            onPress={() => setManualFlip((f) => !f)}
            style={styles.flipButton}
          >
            <Text style={styles.flipIcon}>{"\u21C5"}</Text>
          </Pressable>
        </View>

        <View style={styles.boardCard}>
          <View style={styles.badgeWrapper}>
            <PlayerBadge
              color={topColor}
              label={topLabel}
              isCheck={chess.isCheck && chess.turn === topColor}
              isGameOver={chess.isGameOver || !!gameOverResult}
              statusText={
                (chess.isCheckmate && chess.turn !== topColor) ||
                gameOverResult?.toLowerCase().includes(topColor === "w" ? "white" : "black")
                  ? "Winner"
                  : null
              }
            />
          </View>

          <ChessBoard
            fen={chess.fen}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={
              chess.lastMove
                ? { from: chess.lastMove.from, to: chess.lastMove.to }
                : null
            }
            isCheck={chess.isCheck}
            turn={chess.turn}
            playerColor={playerColor}
            manualFlip={manualFlip}
            onSquareClick={handleSquareClick}
          />

          <View style={styles.badgeWrapper}>
            <PlayerBadge
              color={bottomColor}
              label={bottomLabel}
              isCheck={chess.isCheck && chess.turn === bottomColor}
              isGameOver={chess.isGameOver || !!gameOverResult}
              statusText={
                (chess.isCheckmate && chess.turn !== bottomColor) ||
                gameOverResult?.toLowerCase().includes(bottomColor === "w" ? "white" : "black")
                  ? "Winner"
                  : null
              }
            />
          </View>
        </View>

        <View style={styles.movesWrapper}>
          <MoveHistory moves={chess.moveHistory} />
        </View>

        {(chess.isGameOver || gameOverResult) && (
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Game Finished</Text>
            <Text style={styles.gameOverSubtitle}>{statusText}</Text>
            <Button
              variant="default"
              size="md"
              onPress={() => navigation.navigate("GameLobby")}
              style={styles.gameOverButton}
            >
              Play Again
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    flexGrow: 1,
    gap: 12,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backArrow: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  statusBox: {
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  checkBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.accentAmber,
    letterSpacing: 0.5,
  },
  flipButton: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  flipIcon: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  boardCard: {
    alignItems: "center",
    width: "100%",
    gap: 10,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeWrapper: {
    width: "100%",
    maxWidth: 380,
  },
  movesWrapper: {
    width: "100%",
    maxWidth: 380,
  },
  gameOverCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  gameOverTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  gameOverSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accentAmber,
    marginBottom: 12,
  },
  gameOverButton: {
    width: "100%",
  },
});
