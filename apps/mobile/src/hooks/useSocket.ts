import { useState, useEffect, useCallback } from "react";
import { socketService, type GameInitPayload } from "../services/websocket/socket";
import type { MovePayload } from "@repo/types/message";

export default function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(socketService.isConnected());

  useEffect(() => {
    const unsubscribe = socketService.onStatusChange((status) => {
      setIsConnected(status);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const openGame = useCallback(() => {
    socketService.connect();
  }, []);

  const sendMove = useCallback((payload: MovePayload) => {
    return socketService.sendMove(payload);
  }, []);

  const onInitGame = useCallback((callback: (payload: GameInitPayload) => void) => {
    return socketService.onInitGame(callback);
  }, []);

  const onMove = useCallback((callback: (payload: MovePayload) => void) => {
    return socketService.onMove(callback);
  }, []);

  const onGameOver = useCallback((callback: (payload: { winner: string | null }) => void) => {
    return socketService.onGameOver(callback);
  }, []);

  const onInfo = useCallback((callback: (payload: { info: string }) => void) => {
    return socketService.onInfo(callback);
  }, []);

  return {
    isConnected,
    openGame,
    sendMove,
    onInitGame,
    onMove,
    onGameOver,
    onInfo,
  };
}
