import { useEffect, useState } from "react";

const WEBSOCKET_URL = "ws://localhost:8080"

export default function useSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = () => {
            console.log("Websocket connection established");
            setSocket(ws);
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const {type, payload} = message;
            if (type === "init_game") {
                console.log("Game initialized:", payload);
            }
        }

        ws.onclose = () => {
            setSocket(null);
            console.log("Websocket connection closed!");
        }

        return () => {
            console.log("Closing websocket connection");
            ws.close();
        }
    }, []);

    return socket;
}