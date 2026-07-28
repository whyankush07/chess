import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WEBSOCKET_URL = "ws://localhost:8080"

export default function useSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();

    const openGame = () => {
        if (socket) return;
        const ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = () => {
            console.log("Websocket connection established");
            setSocket(ws);
            ws.send(JSON.stringify({ type: "init_game" }));
        }
    }

    useEffect(() => {
        if (!socket) return;
        console.log("Websocket running.....");

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const { type, payload } = message;
            if (type === "init_game") {
                console.log("Game initialized:", payload);
                router.push(`/game/${payload.gameId}`);
            }
        }

        socket.onclose = () => {
            setSocket(null);
            console.log("Websocket connection closed!");
        }

        return () => {
            console.log("Closing websocket connection");
            socket?.close();
        }
    }, [socket]);

    return { socket, openGame };
}