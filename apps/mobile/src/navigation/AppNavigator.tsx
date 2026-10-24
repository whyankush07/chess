import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { HomeScreen } from "../screens/HomeScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { GameLobbyScreen } from "../screens/GameLobbyScreen";
import { GameScreen } from "../screens/GameScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const NavContainer = NavigationContainer as unknown as React.ComponentType<{
  children: React.ReactNode;
}>;
const Navigator = Stack.Navigator as unknown as React.ComponentType<{
  initialRouteName?: keyof RootStackParamList;
  screenOptions?: unknown;
  children: React.ReactNode;
}>;
const Screen = Stack.Screen as unknown as React.ComponentType<{
  name: keyof RootStackParamList;
  component: React.ComponentType<any>;
}>;

export const AppNavigator: React.FC = () => {
  return (
    <NavContainer>
      <Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Screen name="Home" component={HomeScreen} />
        <Screen name="Auth" component={AuthScreen} />
        <Screen name="GameLobby" component={GameLobbyScreen} />
        <Screen name="Game" component={GameScreen} />
      </Navigator>
    </NavContainer>
  );
};
