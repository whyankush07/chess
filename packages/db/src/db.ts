import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

export class DB {
    client: Pool;

    constructor(dbUrl: string) {
        this.client = new Pool({
            connectionString: dbUrl,
            max: 25,
            idleTimeoutMillis: 30000
        });
    }

    async RunMigrations(): Promise<void> {
        console.log("Starting database migrations...");
        const migrationsDir = path.join(__dirname, "..", "migrations");
        const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            console.log(`Running migration file: ${file}`);
            const content = fs.readFileSync(filePath, "utf-8");
            await this.client.query(content);
        }

        console.log("Database migrations applied successfully!");
    }

    async close() {
        this.client.end();
    }
}