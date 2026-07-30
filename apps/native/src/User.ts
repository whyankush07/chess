import { WebSocket } from "ws";

export class User {
    id: string;
    private ws: WebSocket;

    constructor(id: string, ws: WebSocket) {
        this.id = id;
        this.ws = ws;
    }

    send(data: Record<string, any>) {
        this.ws.send(JSON.stringify(data));
    }

    close() {
        this.ws.close();
    }

    onMessage(handler: (data: string) => void) {
        this.ws.on("message", (data: Buffer) => {
            handler(data.toString());
        });
    }

    onClose(handler: () => void) {
        this.ws.on("close", handler);
    }
}
