import { MOVE_EVENT } from "@repo/types/chess";
import { Consumer } from "./Consumer";
import { persistMove } from "@repo/db/queries/moves"

const consumer = new Consumer("redis://localhost:6379");
const STREAM = "game:moves"

async function main() {
    console.log("History worker is reading!!")
    while (true) {
        const result = await consumer.consume(STREAM);
        if (!result) continue;

        for (const [, entries] of result as [string, [string, string[][]]][]) {
            for (const [id, fields] of result) {
                const event: MOVE_EVENT = JSON.parse(fields[1]);
                await persistMove(event);
                await consumer.acknowlegde(STREAM, id);
            }
        }
    }
}

main().catch(console.error);