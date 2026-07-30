import { MOVE_EVENT } from "@repo/types/chess";
import { Consumer } from "./Consumer";
import { persistMove } from "@repo/db/queries/moves"

const consumer = new Consumer("redis://localhost:6379");
const STREAM = "game:moves"

async function main() {
    console.log("History worker is reading!!");
    await consumer.ensureGroup();

    while (true) {
        const result = await consumer.consume(STREAM);
        if (!result) continue;

        for (const [streamName, entries] of result as [string, [string, string[]][]][]) {
            if (streamName !== STREAM) continue;

            for (const [id, fields] of entries) {
                let payload: string | undefined;
                for (let i = 0; i < fields.length; i += 2) {
                    if (fields[i] === "payload") {
                        payload = fields[i + 1];
                        break;
                    }
                }
                if (!payload) continue;

                const event: MOVE_EVENT = JSON.parse(payload);
                console.log("Received event:", id, " -> ", event);
                await persistMove(event);
                await consumer.acknowlegde(STREAM, id);
            }
        }
    }
}

main().catch(console.error);