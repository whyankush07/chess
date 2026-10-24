import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
} from "react-native";
import { colors } from "../constants/colors";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

interface ToastContextType {
  show: (text: string, type?: ToastType) => void;
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let globalToastHandler: ((text: string, type: ToastType) => void) | null = null;

export const toast = {
  success: (msg: string) => globalToastHandler?.(msg, "success"),
  error: (msg: string) => globalToastHandler?.(msg, "error"),
  info: (msg: string) => globalToastHandler?.(msg, "info"),
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  const removeMessage = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const show = useCallback((text: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setMessages((prev) => [...prev.slice(-2), { id, text, type }]);
    setTimeout(() => {
      removeMessage(id);
    }, 3500);
  }, [removeMessage]);

  useEffect(() => {
    globalToastHandler = show;
    return () => {
      globalToastHandler = null;
    };
  }, [show]);

  useEffect(() => {
    if (messages.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [messages, fadeAnim]);

  return (
    <ToastContext.Provider
      value={{
        show,
        success: (msg) => show(msg, "success"),
        error: (msg) => show(msg, "error"),
        info: (msg) => show(msg, "info"),
      }}
    >
      {children}
      {messages.length > 0 && (
        <SafeAreaView pointerEvents="none" style={styles.container}>
          <Animated.View style={[styles.toastList, { opacity: fadeAnim }]}>
            {messages.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.toast,
                  item.type === "success" && styles.toastSuccess,
                  item.type === "error" && styles.toastError,
                  item.type === "info" && styles.toastInfo,
                ]}
              >
                <Text
                  style={[
                    styles.toastText,
                    item.type === "success" && styles.textSuccess,
                    item.type === "error" && styles.textError,
                    item.type === "info" && styles.textInfo,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            ))}
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "android" ? 36 : 12,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastList: {
    gap: 8,
  },
  toast: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastSuccess: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  toastError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  toastInfo: {
    backgroundColor: "#ffffff",
    borderColor: colors.border,
  },
  toastText: {
    fontSize: 14,
    fontWeight: "500",
  },
  textSuccess: {
    color: "#166534",
  },
  textError: {
    color: "#991b1b",
  },
  textInfo: {
    color: colors.textPrimary,
  },
});
