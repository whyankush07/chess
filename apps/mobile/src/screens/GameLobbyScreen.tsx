import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { AppNavigationProp } from "../types/navigation";
import { ChessBoard } from "../components/ChessBoard";
import { PlayerBadge } from "../components/PlayerBadge";
import { Button } from "../components/Button";
import { colors } from "../constants/colors";
import { toast } from "../components/Toast";
import useChess from "../hooks/useChess";
import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";

export const GameLobbyScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [playerColor] = useState<"w" | "b">("w");
  const [manualFlip, setManualFlip] = useState(false);
  const [starting, setStarting] = useState(false);

  const { openGame, onInitGame, onInfo } = useSocket();
  const { user } = useAuth();
  const chess = useChess();

  useEffect(() => {
    const unsubInit = onInitGame((payload) => {
      setStarting(false);
      navigation.navigate("Game", {
        gameId: payload.gameId,
        color: payload.color,
      });
    });

    const unsubInfo = onInfo((payload) => {
      toast.info(payload.info);
    });

    return () => {
      unsubInit();
      unsubInfo();
    };
  }, [navigation, onInitGame, onInfo]);

  const handleInitGame = () => {
    try {
      setStarting(true);
      openGame();
      toast.success("Game started! Waiting for an opponent...");
    } catch {
      setStarting(false);
      toast.error("Failed to start a new game. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.navigate("Home")}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>{"\u2190"}</Text>
            <Text style={styles.backText}>Home</Text>
          </Pressable>
          <Text style={styles.screenTitle}>Matchmaking</Text>
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
              color={manualFlip ? "w" : "b"}
              label={manualFlip ? (user?.username || "You (White)") : "Opponent"}
            />
          </View>

          <ChessBoard
            fen={chess.fen}
            selectedSquare={null}
            validMoves={[]}
            lastMove={null}
            isCheck={false}
            turn={chess.turn}
            playerColor={playerColor}
            manualFlip={manualFlip}
          />

          <View style={styles.badgeWrapper}>
            <PlayerBadge
              color={manualFlip ? "b" : "w"}
              label={manualFlip ? "Opponent" : (user?.username || "You (White)")}
            />
          </View>
        </View>

        <View style={styles.actionSection}>
          <Button
            variant="default"
            size="lg"
            onPress={handleInitGame}
            loading={starting}
            style={styles.newGameButton}
          >
            {starting ? "Searching for Opponent..." : "New Game"}
          </Button>

          {starting && (
            <Text style={styles.waitingText}>
              Waiting for another player to join...
            </Text>
          )}
        </View>
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
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "space-between",
    flexGrow: 1,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  screenTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
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
    paddingVertical: 16,
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
  actionSection: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  newGameButton: {
    width: "100%",
  },
  waitingText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: "center",
  },
});
