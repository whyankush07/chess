import { DB } from "./db";
import { DB_URL } from "./config";

const db = new DB(DB_URL);
// db.RunMigrations();

export default db;