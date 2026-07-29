import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MOVE, INIT_GAME } from "@repo/types/message";

const WEBSOCKET_URL = "ws://localhost:8080"

let globalSocket: WebSocket | null = null;

type MovePayload = { from: string; to: string; promotion?: string };
let moveCallback: ((payload: MovePayload) => void) | null = null;

export function setMoveCallback(cb: ((payload: MovePayload) => void) | null) {
    moveCallback = cb;
}

export default function useSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(globalSocket);
    const router = useRouter();

    const openGame = () => {
        if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
            return;
        }
        const ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = () => {
            console.log("Websocket connection established");
            globalSocket = ws;
            setSocket(ws);
            ws.send(JSON.stringify({ type: INIT_GAME }));
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const { type, payload } = message;
            if (type === INIT_GAME) {
                console.log("Game initialized:", payload);
                const color = payload.color === "White" ? "w" : "b";
                router.push(`/game/${payload.gameId}?color=${color}`);
            } else if (type === MOVE) {
                console.log("Move received:", payload);
                moveCallback?.(payload);
            }
        }

        ws.onclose = () => {
            console.log("Websocket connection closed!");
            globalSocket = null;
            setSocket(null);
        }
    }

    useEffect(() => {
        return () => {
            // socket lifecycle is managed by openGame/onclose — no close on unmount
        }
    }, []);

    return { socket, openGame };
}