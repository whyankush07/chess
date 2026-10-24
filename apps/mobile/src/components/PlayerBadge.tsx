import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

interface PlayerBadgeProps {
  color: "w" | "b";
  label?: string;
  isCheck?: boolean;
  isGameOver?: boolean;
  statusText?: string | null;
}

export const PlayerBadge: React.FC<PlayerBadgeProps> = ({
  color,
  label,
  isCheck,
  isGameOver,
  statusText,
}) => {
  const displayLabel = label || (color === "w" ? "White" : "Black");

  return (
    <View style={styles.container}>
      <View style={styles.playerInfo}>
        <View
          style={[
            styles.dot,
            color === "w" ? styles.whiteDot : styles.blackDot,
          ]}
        />
        <Text style={styles.labelText}>{displayLabel}</Text>
      </View>

      {isCheck && !isGameOver && (
        <View style={styles.statusBadge}>
          <Text style={styles.checkText}>Check</Text>
        </View>
      )}

      {isGameOver && statusText && (
        <View style={styles.statusBadge}>
          <Text style={styles.gameOverText}>{statusText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardDark,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#525252",
  },
  whiteDot: {
    backgroundColor: "#d4d4d4",
  },
  blackDot: {
    backgroundColor: "#171717",
  },
  labelText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    backgroundColor: "transparent",
  },
  checkText: {
    color: colors.accentAmber,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  gameOverText: {
    color: colors.accentAmber,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
