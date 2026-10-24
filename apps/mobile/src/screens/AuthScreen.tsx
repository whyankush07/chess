import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { AppNavigationProp, AuthRouteProp } from "../types/navigation";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { colors } from "../constants/colors";
import { toast } from "../components/Toast";
import useAuth from "../hooks/useAuth";

const features = [
  {
    icon: "\u265E",
    title: "Live Matches",
    text: "Get paired with a player and start playing in seconds.",
  },
  {
    icon: "\u265B",
    title: "Real-Time Play",
    text: "Every move streams instantly over WebSockets.",
  },
  {
    icon: "\u265D",
    title: "Game History",
    text: "Your completed games are recorded for review anytime.",
  },
];

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<AuthRouteProp>();
  const initialMode = route.params?.initialMode ?? "signin";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const isSignin = mode === "signin";

  const handleSubmit = async () => {
    if (!email || !password || (!isSignin && !username)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (isSignin) {
        const res = await signIn(email, password);
        if (res.ok) {
          toast.success(res.data?.msg || "Signed in successfully!");
          navigation.navigate("GameLobby");
        } else {
          toast.error(res.error || "Sign in failed");
        }
      } else {
        const res = await signUp(username, email, password);
        if (res.ok) {
          toast.success(res.data?.msg || "Account created! Please sign in.");
          setMode("signin");
        } else {
          toast.error(res.error || "Sign up failed");
        }
      }
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.navigate("Home")}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>{"\u2190"}</Text>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Text style={styles.brandTag}>MULTIPLAYER</Text>
          </View>

          <View style={styles.cardSection}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                {isSignin ? "Welcome back" : "Join the game"}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isSignin
                  ? "Sign in to continue to your games"
                  : "Create an account and start playing"}
              </Text>
            </View>

            <View style={styles.tabContainer}>
              <Pressable
                onPress={() => setMode("signin")}
                style={[styles.tabButton, isSignin && styles.tabButtonActive]}
              >
                <Text
                  style={[styles.tabText, isSignin && styles.tabTextActive]}
                >
                  SIGN IN
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode("signup")}
                style={[styles.tabButton, !isSignin && styles.tabButtonActive]}
              >
                <Text
                  style={[styles.tabText, !isSignin && styles.tabTextActive]}
                >
                  SIGN UP
                </Text>
              </Pressable>
            </View>

            <View style={styles.formContainer}>
              {!isSignin && (
                <Input
                  label="Username"
                  placeholder="Your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              )}

              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Input
                label="Password"
                placeholder="Your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                variant="default"
                size="md"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
              >
                {isSignin ? "Sign In" : "Create Account"}
              </Button>
            </View>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.featuresHeading}>Every move matters.</Text>
            <Text style={styles.featuresSubheading}>
              Challenge players, think ahead, and claim your victory.
            </Text>

            <View style={styles.featureList}>
              {features.map((feat) => (
                <View key={feat.title} style={styles.featureItem}>
                  <View style={styles.featureIconBox}>
                    <Text style={styles.featureIcon}>{feat.icon}</Text>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feat.title}</Text>
                    <Text style={styles.featureText}>{feat.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backArrow: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  brandTag: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 1,
  },
  cardSection: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.border,
    borderRadius: 4,
    padding: 2,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 3,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  formContainer: {
    width: "100%",
  },
  submitButton: {
    marginTop: 6,
    width: "100%",
  },
  featuresSection: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 8,
    padding: 20,
  },
  featuresHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textLight,
    marginBottom: 4,
  },
  featuresSubheading: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  featureList: {
    gap: 14,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#404040",
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: {
    fontSize: 18,
    color: colors.textLight,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textLight,
    marginBottom: 2,
  },
  featureText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
