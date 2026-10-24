import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { colors } from "../constants/colors";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isInteractive = !disabled && !loading;

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        pressed && isInteractive && styles[`${variant}_pressed`],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "default" ? "#ffffff" : colors.textPrimary}
        />
      ) : typeof children === "string" ? (
        <Text
          style={[
            styles.textBase,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
            disabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  default: {
    backgroundColor: colors.primary,
  },
  default_pressed: {
    backgroundColor: colors.primaryHover,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  outline_pressed: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  secondary: {
    backgroundColor: colors.border,
  },
  secondary_pressed: {
    backgroundColor: "#d4d4d4",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghost_pressed: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  size_md: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  size_lg: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  textBase: {
    fontWeight: "600",
    textAlign: "center",
  },
  text_default: {
    color: colors.primaryText,
  },
  text_outline: {
    color: colors.textPrimary,
  },
  text_secondary: {
    color: colors.textPrimary,
  },
  text_ghost: {
    color: colors.textPrimary,
  },
  textDisabled: {
    color: colors.textMuted,
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 14,
  },
  textSize_lg: {
    fontSize: 16,
  },
});
