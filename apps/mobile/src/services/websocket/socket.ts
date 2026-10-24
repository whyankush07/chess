import { INIT_GAME, MOVE, GAME_OVER, INFO, type MovePayload } from "@repo/types/message";
import { WEBSOCKET_URL } from "../../constants/config";
import { getStoredUserId } from "../../utils/storage";

export interface GameInitPayload {
  gameId: string;
  color: "w" | "b";
  info?: string;
}

export interface GameOverPayload {
  winner: string | null;
}

export interface InfoPayload {
  info: string;
}

type InitGameListener = (payload: GameInitPayload) => void;
type MoveListener = (payload: MovePayload) => void;
type GameOverListener = (payload: GameOverPayload) => void;
type InfoListener = (payload: InfoPayload) => void;
type StatusListener = (connected: boolean) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private initListeners = new Set<InitGameListener>();
  private moveListeners = new Set<MoveListener>();
  private gameOverListeners = new Set<GameOverListener>();
  private infoListeners = new Set<InfoListener>();
  private statusListeners = new Set<StatusListener>();
  private isConnecting = false;

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public async connect(): Promise<void> {
    if (this.isConnected() || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = async () => {
        this.socket = ws;
        this.isConnecting = false;
        this.notifyStatus(true);

        const userId = await getStoredUserId();
        this.send(INIT_GAME, { userId });
      };

      ws.onmessage = (event: WebSocketMessageEvent) => {
        try {
          const raw = typeof event.data === "string" ? event.data : event.data.toString();
          const message = JSON.parse(raw);
          const { type, payload } = message;

          if (type === INIT_GAME) {
            const color = payload.color === "White" ? "w" : "b";
            const data: GameInitPayload = {
              gameId: payload.gameId,
              color,
              info: payload.info,
            };
            this.initListeners.forEach((listener) => listener(data));
          } else if (type === MOVE) {
            this.moveListeners.forEach((listener) => listener(payload));
          } else if (type === GAME_OVER) {
            this.gameOverListeners.forEach((listener) => listener(payload));
          } else if (type === INFO) {
            this.infoListeners.forEach((listener) => listener(payload));
          }
        } catch {}
      };

      ws.onerror = () => {
        this.isConnecting = false;
        this.notifyStatus(false);
      };

      ws.onclose = () => {
        this.socket = null;
        this.isConnecting = false;
        this.notifyStatus(false);
      };
    } catch {
      this.isConnecting = false;
      this.notifyStatus(false);
    }
  }

  public send(type: string, payload: unknown): boolean {
    if (!this.isConnected() || !this.socket) {
      return false;
    }
    this.socket.send(JSON.stringify({ type, payload }));
    return true;
  }

  public sendMove(payload: MovePayload): boolean {
    return this.send(MOVE, payload);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
    this.notifyStatus(false);
  }

  public onInitGame(listener: InitGameListener): () => void {
    this.initListeners.add(listener);
    return () => {
      this.initListeners.delete(listener);
    };
  }

  public onMove(listener: MoveListener): () => void {
    this.moveListeners.add(listener);
    return () => {
      this.moveListeners.delete(listener);
    };
  }

  public onGameOver(listener: GameOverListener): () => void {
    this.gameOverListeners.add(listener);
    return () => {
      this.gameOverListeners.delete(listener);
    };
  }

  public onInfo(listener: InfoListener): () => void {
    this.infoListeners.add(listener);
    return () => {
      this.infoListeners.delete(listener);
    };
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.isConnected());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(connected: boolean): void {
    this.statusListeners.forEach((listener) => listener(connected));
  }
}

export const socketService = new WebSocketService();
