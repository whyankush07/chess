import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { BACKENDS, pickBackend, forward } from "./helper";

const PROXY_PORT = process.env.PORT || "8080";

const server = http.createServer((req, res) => {
    res.writeHead(200, { "content-type": "plain/text" });
    res.end("WS Proxy healthly\n");
})

const wss = new WebSocketServer({ server });

wss.on("connection", (client, req) => {
    const backend = pickBackend();
    const upstream = new WebSocket(`ws://${backend.host}:${backend.port}`, {
        headers: { ...req.headers },
    });

    backend.connections += 1;

    upstream.on("open", () => forward(upstream, client));
    upstream.on("close", () => { backend.connections -= 1; client.close(); });
    upstream.on("error", () => { backend.connections -= 1; client.close(); });
});

wss.on("listening", () => {
    console.log(`ws-proxy listening on ws://localhost:${PROXY_PORT}`);
    console.log(`backends: ${BACKENDS.map((b) => `${b.host}:${b.port}`).join(", ")}`);
});

server.listen(PROXY_PORT);