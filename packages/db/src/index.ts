import { DB } from "./db";

const DB_URL = process.env.DATABASE_URL || "postgresql://postgres:mysecretpassword@localhost:5432/postgres";
const db = new DB(DB_URL);
db.RunMigrations();

export default db;