import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  Home: undefined;
  Auth: { initialMode?: "signin" | "signup" } | undefined;
  GameLobby: undefined;
  Game: { gameId: string; color: "w" | "b" };
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type GameRouteProp = RouteProp<RootStackParamList, "Game">;
export type AuthRouteProp = RouteProp<RootStackParamList, "Auth">;
