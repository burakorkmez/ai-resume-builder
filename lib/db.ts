import { Pool } from "pg";
import { env } from "./env";
import type { Plan } from "./resume";

// One small pool per server process on Neon's pooled endpoint (the app runs as a persistent Node server).
export const pool = new Pool({ connectionString: env("DATABASE_URL"), max: 5 });
pool.on("error", (e) => console.error("Postgres pool error", e)); // a dropped idle client must not crash the server

export type UserRow = {
  id: string;
  plan: Plan;
  free_used: number;
  pro_used: number;
  period_end: Date | null;
  cancel_at_period_end: boolean;
  ai_disclosure_accepted_at: Date | null;
};
