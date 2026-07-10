import { useEffect, useState } from "react";

const SOCKET_URL = "ws://localhost:8080";

export default function useSocket() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(SOCKET_URL);

        ws.onopen = () => {
            setSocket(ws);
        };

        ws.onclose = () => {
            setSocket(null);
        };

        return () => {
            ws.close();
        };
    }, []);

    return socket;
}