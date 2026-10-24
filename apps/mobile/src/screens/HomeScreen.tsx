import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { AppNavigationProp } from "../types/navigation";
import { Button } from "../components/Button";
import { colors } from "../constants/colors";
import useAuth from "../hooks/useAuth";

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { width } = useWindowDimensions();
  const { user, isAuthenticated, signOut } = useAuth();

  const imageSize = Math.min(width - 64, 320);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBar}>
          <Text style={styles.logoText}>Chess</Text>
          {isAuthenticated ? (
            <View style={styles.authBadgeGroup}>
              <Text style={styles.userBadge}>{user?.username || "Player"}</Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={signOut}
                textStyle={styles.authLinkText}
              >
                Sign Out
              </Button>
            </View>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate("Auth")}
            >
              Sign In
            </Button>
          )}
        </View>

        <View style={styles.heroSection}>
          <Image
            source={require("../assets/chessboard.jpg")}
            style={[styles.heroImage, { width: imageSize, height: imageSize }]}
            resizeMode="cover"
          />

          <View style={styles.contentSection}>
            <Text style={styles.title}>Chess</Text>
            <Text style={styles.subtitle}>Play a game of chess</Text>

            <Button
              variant="default"
              size="lg"
              onPress={() => navigation.navigate("GameLobby")}
              style={styles.startButton}
            >
              Start Game
            </Button>
          </View>
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  authBadgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  authLinkText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 16,
  },
  heroImage: {
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 32,
  },
  contentSection: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  startButton: {
    width: "100%",
    maxWidth: 260,
  },
});
