import { DB } from "./db";

const DB_URL = process.env.DATABASE_URL || "";
const db = new DB(DB_URL);
db.RunMigrations();

export default db;