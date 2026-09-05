import { WebSocket } from "ws";

export interface Backend {
    host: string;
    port: number;
    connections: number;
}

export const BACKENDS: Backend[] = (process.env.BACKENDS ?? "localhost:8081,localhost:8082,localhost:8083")
    .split(",")
    .filter((entry) => entry.length > 0)
    .map((entry) => {
        const [host, port] = entry.trim().split(":");
        return { host, port: Number(port), connections: 0 };
    })

export function pickBackend() {
    if (BACKENDS.length === 0) throw new Error("no backends configured...");
    if (BACKENDS.length == 1) return BACKENDS[0];

    return BACKENDS.reduce((a, b) => (a.connections <= b.connections) ? a : b);
}

export function forward(upstream: WebSocket, client: WebSocket) {
    upstream.on("message", (data : any) => {
        if (client.readyState === WebSocket.OPEN) client.send(data);
    });
    upstream.on("close", () => client.close());
    upstream.on("error", () => client.close());

    client.on("message", (data : any) => {
        if (upstream.readyState === WebSocket.OPEN) upstream.send(data);
    });
    client.on("close", () => upstream.close());
    client.on("error", () => upstream.close());
}