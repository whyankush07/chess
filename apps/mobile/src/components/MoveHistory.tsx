import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { Move } from "chess.js";
import { colors } from "../constants/colors";

interface MovePair {
  white: Move;
  black: Move | null;
}

interface MoveHistoryProps {
  moves: Move[];
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  const scrollViewRef = useRef<any>(null);

  const movePairs: MovePair[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      white: moves[i]!,
      black: moves[i + 1] ?? null,
    });
  }

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [moves.length]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moves</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={
          movePairs.length === 0 ? styles.emptyScroll : styles.listScroll
        }
      >
        {movePairs.length === 0 ? (
          <Text style={styles.emptyText}>No moves yet</Text>
        ) : (
          movePairs.map((pair, index) => {
            const isLatest = moves.length - (index * 2 + 1) <= 2;
            return (
              <View
                key={index}
                style={[styles.row, isLatest && styles.latestRow]}
              >
                <Text style={styles.indexCol}>{index + 1}.</Text>
                <Text style={styles.moveCol}>{pair.white.san}</Text>
                <Text style={styles.moveCol}>{pair.black?.san ?? ""}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
    width: "100%",
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "#fafafa",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scrollArea: {
    maxHeight: 180,
    minHeight: 100,
  },
  listScroll: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  emptyScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 90,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  latestRow: {
    backgroundColor: "#fffbeb",
  },
  indexCol: {
    width: 32,
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
    fontFamily: "monospace",
  },
  moveCol: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    fontFamily: "monospace",
  },
});
