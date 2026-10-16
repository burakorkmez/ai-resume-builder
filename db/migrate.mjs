// Applies db/schema.sql over the direct (unpooled) connection, as Neon recommends for schema changes.
import { readFileSync } from "node:fs";
import pg from "pg";

if (!process.env.DATABASE_URL_UNPOOLED) throw new Error("Missing environment variable DATABASE_URL_UNPOOLED. Set it in .env.local.");
const client = new pg.Client(process.env.DATABASE_URL_UNPOOLED);
await client.connect();
await client.query(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
await client.end();
console.log("Schema applied.");
