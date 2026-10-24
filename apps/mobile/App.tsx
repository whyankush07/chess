import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "./src/components/Toast";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
