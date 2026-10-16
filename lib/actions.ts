"use server";

// The app's data layer. Every action resolves the signed-in user from the Neon Auth session and scopes
// all reads and writes to that owner; nothing about identity, plan, or credits is taken from the client.
import { redirect } from "next/navigation";
import { Pool, type PoolClient } from "pg";
import { auth } from "./auth";
import { env } from "./env";
import {
  COST,
  emptyDoc,
  isResumeDoc,
  isSuggestions,
  PLANS,
  reid,
  type Account,
  type AppState,
  type JobContext,
  type PageSize,
  type Plan,
  type Resume,
  type ResumeDoc,
  type Suggestion,
} from "./resume";

// One small pool per server process on Neon's pooled endpoint (the app runs as a persistent Node server).
const pool = new Pool({ connectionString: env("DATABASE_URL"), max: 5 });
pool.on("error", (e) => console.error("Postgres pool error", e)); // a dropped idle client must not crash the server

type UserRow = {
  id: string;
  plan: Plan;
  free_used: number;
  pro_used: number;
  period_end: Date | null;
  cancel_at_period_end: boolean;
  ai_disclosure_accepted_at: Date | null;
};

type ResumeRow = {
  id: string;
  title: string;
  page_size: PageSize;
  document: ResumeDoc;
  job: JobContext | null;
  suggestions: Suggestion[];
  version: number;
  updated_at: Date;
};

const RESUME = "id, title, page_size, document, job, suggestions, version, updated_at";

const toAccount = (u: UserRow): Account => ({
  plan: u.plan,
  freeUsed: u.free_used,
  proUsed: u.pro_used,
  periodEnd: u.period_end?.toISOString() ?? "",
  cancelAtPeriodEnd: u.cancel_at_period_end,
  aiDisclosureAccepted: !!u.ai_disclosure_accepted_at,
});

const toResume = (r: ResumeRow): Resume => ({
  id: r.id,
  title: r.title,
  pageSize: r.page_size,
  doc: r.document,
  job: r.job ?? undefined,
  suggestions: r.suggestions,
  version: r.version,
  updatedAt: r.updated_at.toISOString(),
});

const creditsLeft = (u: UserRow) => (u.plan === "pro" ? PLANS.pro.credits - u.pro_used : PLANS.free.credits - u.free_used);
const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
const text = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;
const small = (v: unknown) => JSON.stringify(v).length <= 256 * 1024;

async function tx<T>(fn: (c: PoolClient) => Promise<T>) {
  const c = await pool.connect();
  try {
    await c.query("begin");
    const result = await fn(c);
    await c.query("commit");
    return result;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** The signed-in user's app account, created on first use. Redirects to sign-in when there's no session. */
async function me() {
  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user) redirect("/auth/sign-in");
  const find = () => pool.query<UserRow>("select * from app_users where auth_subject = $1", [user.id]);
  let [row] = (await find()).rows;
  if (!row) {
    await pool.query("insert into app_users (auth_subject) values ($1) on conflict do nothing", [user.id]);
    [row] = (await find()).rows;
  }
  return { ...row, name: user.name, email: user.email };
}

async function ownedResume(userId: string, id: unknown) {
  if (!isUuid(id)) return undefined;
  const { rows } = await pool.query<ResumeRow>(`select ${RESUME} from resumes where id = $1 and owner_id = $2`, [id, userId]);
  return rows[0];
}

/** Atomically spends credits from the current plan's balance. Returns the updated row, or nothing if it's too low. */
async function charge(db: Pool | PoolClient, userId: string, cost: number) {
  const { rows } = await db.query<UserRow>(
    `update app_users set
       free_used = free_used + case when plan = 'free' then $2 else 0 end,
       pro_used = pro_used + case when plan = 'pro' then $2 else 0 end
     where id = $1 and (case when plan = 'pro' then $3 - pro_used else $4 - free_used end) >= $2
     returning *`,
    [userId, cost, PLANS.pro.credits, PLANS.free.credits],
  );
  return rows[0] as UserRow | undefined;
}

type NewResume = Pick<Resume, "title" | "pageSize" | "doc" | "suggestions"> & { job?: JobContext | null; sourceId?: string };

/** Inserts a resume if the owner has a free slot, charging `cost` credits in the same transaction. */
function insertResume(userId: string, r: NewResume, cost = 0) {
  return tx(async (c) => {
    // Locking the user row serializes this owner's creates, so two tabs can't both take the last slot.
    let [u] = (await c.query<UserRow>("select * from app_users where id = $1 for update", [userId])).rows;
    const [{ count }] = (await c.query<{ count: number }>("select count(*)::int as count from resumes where owner_id = $1", [userId])).rows;
    if (count >= PLANS[u.plan].resumes) return "no-slot" as const;
    if (cost) {
      const charged = await charge(c, userId, cost);
      if (!charged) return "no-credits" as const;
      u = charged;
    }
    const [row] = (
      await c.query<ResumeRow>(
        `insert into resumes (owner_id, source_resume_id, title, page_size, document, job, suggestions)
         values ($1, $2, $3, $4, $5, $6, $7) returning ${RESUME}`,
        [userId, r.sourceId ?? null, r.title, r.pageSize, JSON.stringify(r.doc), r.job ? JSON.stringify(r.job) : null, JSON.stringify(r.suggestions)],
      )
    ).rows;
    return { resume: toResume(row), account: toAccount(u) };
  });
}

/** Calls the `ai` Neon Function with the user's short-lived Neon Auth JWT. "too-long" means the input is over the action's budget. */
async function callAi<T>(body: object): Promise<T | "too-long"> {
  const { data } = await auth.token();
  if (!data?.token) throw new Error("No auth token for the AI function");
  const res = await fetch(env("NEON_FUNCTION_AI_BASE_URL"), {
    method: "POST",
    headers: { authorization: `Bearer ${data.token}`, "x-app-secret": env("AI_FUNCTION_SECRET"), "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(50_000), // the Function gives the model 45s
  });
  if (res.status === 413) return "too-long";
  if (!res.ok) throw new Error(`AI function responded ${res.status}`);
  return res.json();
}

export async function loadState(): Promise<AppState> {
  const u = await me();
  // ponytail: loads every document up front (max 20 per user); split list metadata from documents if this grows.
  const { rows } = await pool.query<ResumeRow>(`select ${RESUME} from resumes where owner_id = $1 order by updated_at desc`, [u.id]);
  return { user: { name: u.name, email: u.email }, ...toAccount(u), resumes: rows.map(toResume) };
}

export async function createResume() {
  const u = await me();
  return insertResume(u.id, { title: "Untitled resume", pageSize: "A4", doc: emptyDoc(), suggestions: [] });
}

/** Copies an owned resume. Keeps its job context, not its review history. */
export async function duplicateResume(id: string) {
  const u = await me();
  const src = await ownedResume(u.id, id);
  if (!src) throw new Error("Resume not found");
  return insertResume(u.id, {
    title: `${src.title} — Copy`.slice(0, 120),
    pageSize: src.page_size,
    doc: reid(src.document),
    job: src.job,
    suggestions: [],
    sourceId: src.id,
  });
}

/** Autosave. Applies only on top of the version the client last saw; returns null on a conflict. */
export async function saveResume(r: Pick<Resume, "id" | "title" | "pageSize" | "doc" | "suggestions" | "version">) {
  const u = await me();
  const title = typeof r.title === "string" ? r.title.trim() : "";
  const valid =
    isUuid(r.id) &&
    text(title, 120) &&
    !!title &&
    (r.pageSize === "A4" || r.pageSize === "LETTER") &&
    Number.isInteger(r.version) &&
    isResumeDoc(r.doc) &&
    isSuggestions(r.suggestions) &&
    small(r.doc) &&
    small(r.suggestions);
  if (!valid) throw new Error("Invalid resume");
  const { rows } = await pool.query<{ version: number; updated_at: Date }>(
    `update resumes set title = $3, page_size = $4, document = $5, suggestions = $6, version = version + 1, updated_at = now()
     where id = $1 and owner_id = $2 and version = $7
     returning version, updated_at`,
    [r.id, u.id, title, r.pageSize, JSON.stringify(r.doc), JSON.stringify(r.suggestions), r.version],
  );
  return rows[0] ? { version: rows[0].version, updatedAt: rows[0].updated_at.toISOString() } : null;
}

export async function deleteResume(id: string) {
  const u = await me();
  if (isUuid(id)) await pool.query("delete from resumes where id = $1 and owner_id = $2", [id, u.id]);
}

type SuggestRequest = { kind: "bullet"; text: string; context?: string } | { kind: "summary"; doc: ResumeDoc };

/** One paid AI suggestion. Credits are charged only once a result comes back. */
export async function suggest(req: SuggestRequest) {
  const u = await me();
  const body =
    req?.kind === "bullet" && text(req.text, 1000) && (req.context === undefined || text(req.context, 400))
      ? { kind: req.kind, text: req.text, context: req.context }
      : req?.kind === "summary" && isResumeDoc(req.doc) && small(req.doc)
        ? { kind: req.kind, doc: req.doc }
        : null;
  if (!body) throw new Error("Invalid request");
  const cost = COST[body.kind];
  if (creditsLeft(u) < cost) return "no-credits" as const;
  const result = await callAi<{ proposed: string; reason: string; note?: string }>(body);
  if (result === "too-long") return result;
  const charged = await charge(pool, u.id, cost);
  if (!charged) return "no-credits" as const;
  return { result, account: toAccount(charged) };
}

/** A tailored copy of an owned resume with AI suggestions to review. Uses a resume slot and COST.tailor credits. */
export async function tailorResume(sourceId: string, job: Omit<JobContext, "tailoredAt">) {
  const u = await me();
  if (!text(job?.title, 200) || !job.title.trim() || !text(job.company, 200) || !text(job.description, 15000) || !job.description.trim()) {
    throw new Error("Invalid job");
  }
  const src = await ownedResume(u.id, sourceId);
  if (!src) throw new Error("Resume not found");
  if (creditsLeft(u) < COST.tailor) return "no-credits" as const;
  const doc = reid(src.document);
  const context = { title: job.title.trim(), company: job.company.trim(), description: job.description.trim(), tailoredAt: new Date().toISOString() };
  const suggestions = await callAi<Suggestion[]>({ kind: "tailor", doc, job: context });
  if (suggestions === "too-long") return suggestions;
  if (!isSuggestions(suggestions)) throw new Error("Invalid AI response");
  const title = (context.company ? `${context.title} at ${context.company}` : context.title).slice(0, 120);
  return insertResume(u.id, { title, pageSize: src.page_size, doc, job: context, suggestions, sourceId: src.id }, COST.tailor);
}

async function updateAccount(set: string, where: string, params: unknown[] = []) {
  const u = await me();
  const { rows } = await pool.query<UserRow>(`update app_users set ${set} where id = $1 and ${where} returning *`, [u.id, ...params]);
  return toAccount(rows[0] ?? u);
}

export async function acceptAiDisclosure() {
  return updateAccount("ai_disclosure_accepted_at = now()", "ai_disclosure_accepted_at is null");
}

// ponytail: demo billing with no payment, so these would let anyone give themselves Pro. They only run where the
// server sets DEMO_BILLING=true (local dev); replace with Polar checkout + verified webhooks (plan.md §9).
function demoBilling(set: string, where: string, params?: unknown[]) {
  if (process.env.DEMO_BILLING !== "true") throw new Error("Demo billing is turned off on this server");
  return updateAccount(set, where, params);
}

export async function startPro() {
  return demoBilling("plan = 'pro', pro_used = 0, cancel_at_period_end = false, period_end = now() + interval '1 month'", "plan = 'free'");
}

export async function setCancelAtPeriodEnd(cancel: boolean) {
  return demoBilling("cancel_at_period_end = $2", "plan = 'pro'", [cancel === true]);
}

/** Demo shortcut: ends a canceled Pro period early. */
export async function endProPeriod() {
  return demoBilling("plan = 'free', cancel_at_period_end = false, period_end = null", "plan = 'pro' and cancel_at_period_end");
}

/** Deletes the app account and, by cascade, every resume. */
export async function deleteAccount() {
  const u = await me();
  await pool.query("delete from app_users where id = $1", [u.id]);
}
