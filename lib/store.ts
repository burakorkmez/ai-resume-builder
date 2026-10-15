// ponytail: fake backend. The whole app state lives in one client store persisted to localStorage so the
// demo survives refreshes. Replace with the server data layer + API routes from plan.md §6; the real
// product must not keep resume bodies in browser storage (plan.md §7).
import { useSyncExternalStore } from "react";
import { tailorSuggestions } from "./fake-ai";
import { emptyDoc, sampleDoc, type JobContext, type Resume, type ResumeDoc, type Suggestion } from "./resume";

export type Plan = "free" | "pro";

export type AppState = {
  user: { name: string; email: string };
  plan: Plan;
  freeUsed: number;
  proUsed: number;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
  aiDisclosureAccepted: boolean;
  resumes: Resume[];
};

export const PLANS = {
  free: { name: "Free", resumes: 2, credits: 10 },
  pro: { name: "Pro", resumes: 20, credits: 200 },
} as const;

const KEY = "veyro-demo-v1";
const listeners = new Set<() => void>();
let state: AppState | null = null;

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

function seed(): AppState {
  const draft: ResumeDoc = structuredClone(sampleDoc);
  draft.experience[0].bullets[1].text = "Was responsible for onboarding new customers and helping them with problems.";
  draft.experience[0].bullets[2].text = "Did quarterly meetings with customers and told the product team what they said.";
  return {
    user: { name: sampleDoc.contact.name, email: sampleDoc.contact.email },
    plan: "free",
    freeUsed: 3,
    proUsed: 0,
    periodEnd: "",
    cancelAtPeriodEnd: false,
    aiDisclosureAccepted: false,
    resumes: [{ id: "elena-cs", title: "Customer Success resume", updatedAt: hoursAgo(2), pageSize: "A4", doc: draft, suggestions: [] }],
  };
}

// ponytail: hand-rolled shape check for saved demo data; becomes the shared zod schema from plan.md §4.
type Obj = Record<string, unknown>;
const obj = (v: unknown): v is Obj => typeof v === "object" && v !== null;
const str = (v: unknown): v is string => typeof v === "string";
const strs = (v: unknown) => Array.isArray(v) && v.every(str);
const fields = (o: Obj, keys: string[]) => keys.every((k) => str(o[k]));
const items = (v: unknown, valid: (o: Obj) => boolean) => Array.isArray(v) && v.every((o) => obj(o) && str(o.id) && valid(o));
const bullets = (o: Obj) => items(o.bullets, (b) => str(b.text));

const isSuggestion = (s: Obj) =>
  str(s.reason) &&
  (s.kind === "skills"
    ? strs(s.original) && strs(s.proposed)
    : (s.kind === "summary" || (s.kind === "bullet" && str(s.bulletId))) && str(s.original) && str(s.proposed));

function isResume(r: Obj) {
  const doc = r.doc;
  return (
    fields(r, ["title", "updatedAt"]) &&
    (r.pageSize === "A4" || r.pageSize === "LETTER") &&
    items(r.suggestions, isSuggestion) &&
    (r.job === undefined || (obj(r.job) && fields(r.job, ["title", "company", "description", "tailoredAt"]))) &&
    obj(doc) &&
    str(doc.summary) &&
    obj(doc.contact) &&
    fields(doc.contact, Object.keys(emptyDoc().contact)) &&
    items(doc.experience, (e) => fields(e, ["role", "employer", "location", "start", "end"]) && typeof e.current === "boolean" && bullets(e)) &&
    items(doc.education, (e) => fields(e, ["degree", "field", "institution", "location", "start", "end", "details"]) && typeof e.current === "boolean") &&
    items(doc.projects, (p) => fields(p, ["name", "role", "url", "start", "end"]) && bullets(p)) &&
    items(doc.skills, (s) => str(s.name))
  );
}

function isAppState(v: unknown): v is AppState {
  return (
    obj(v) &&
    obj(v.user) &&
    fields(v.user, ["name", "email"]) &&
    (v.plan === "free" || v.plan === "pro") &&
    Number.isInteger(v.freeUsed) &&
    Number.isInteger(v.proUsed) &&
    str(v.periodEnd) &&
    typeof v.cancelAtPeriodEnd === "boolean" &&
    typeof v.aiDisclosureAccepted === "boolean" &&
    items(v.resumes, isResume)
  );
}

function read(): AppState {
  if (!state) {
    let saved: unknown = null;
    try {
      saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    } catch {}
    state = isAppState(saved) ? saved : seed();
  }
  return state;
}

function write(next: AppState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

const update = (fn: (s: AppState) => AppState) => write(fn(read()));

/** null during server render and hydration; the real state right after. */
export function useAppState() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    read,
    () => null,
  );
}

export function usage(s: AppState) {
  const plan = PLANS[s.plan];
  const credits = plan.credits - (s.plan === "pro" ? s.proUsed : s.freeUsed);
  return { plan, credits, resumes: s.resumes.length, canCreate: s.resumes.length < plan.resumes };
}

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

/** Fresh ids for every entry, bullet, and skill, so copies never share ids with their source. */
function reid(doc: ResumeDoc): ResumeDoc {
  const bullets = (list: { id: string; text: string }[]) => list.map((b) => ({ ...b, id: uid() }));
  return {
    ...structuredClone(doc),
    experience: doc.experience.map((e) => ({ ...e, id: uid(), bullets: bullets(e.bullets) })),
    education: doc.education.map((e) => ({ ...e, id: uid() })),
    projects: doc.projects.map((p) => ({ ...p, id: uid(), bullets: bullets(p.bullets) })),
    skills: doc.skills.map((s) => ({ ...s, id: uid() })),
  };
}

const patch = (id: string, fn: (r: Resume) => Resume) =>
  update((s) => ({ ...s, resumes: s.resumes.map((r) => (r.id === id ? fn(r) : r)) }));

export function createResume() {
  if (!usage(read()).canCreate) return null;
  const resume: Resume = { id: uid(), title: "Untitled resume", updatedAt: now(), pageSize: "A4", doc: emptyDoc(), suggestions: [] };
  update((s) => ({ ...s, resumes: [resume, ...s.resumes] }));
  return resume.id;
}

export function duplicateResume(id: string) {
  const source = read().resumes.find((r) => r.id === id);
  if (!source || !usage(read()).canCreate) return null;
  const copy: Resume = { ...source, id: uid(), title: `${source.title} — Copy`, updatedAt: now(), doc: reid(source.doc), suggestions: [] };
  update((s) => ({ ...s, resumes: [copy, ...s.resumes] }));
  return copy.id;
}

export const renameResume = (id: string, title: string) => patch(id, (r) => ({ ...r, title, updatedAt: now() }));

export const deleteResume = (id: string) => update((s) => ({ ...s, resumes: s.resumes.filter((r) => r.id !== id) }));

export const editResume = (id: string, fn: (r: Resume) => Resume) => patch(id, (r) => ({ ...fn(r), updatedAt: now() }));

/** Charges credits for a delivered AI result. Returns false when the balance is too low. */
export function spendCredits(cost: number) {
  const s = read();
  if (usage(s).credits < cost) return false;
  update((s) => (s.plan === "pro" ? { ...s, proUsed: s.proUsed + cost } : { ...s, freeUsed: s.freeUsed + cost }));
  return true;
}

export function tailorResume(sourceId: string, job: Omit<JobContext, "tailoredAt">) {
  const s = read();
  const source = s.resumes.find((r) => r.id === sourceId);
  if (!source || !usage(s).canCreate) return null;
  const doc = reid(source.doc);
  const context = { ...job, tailoredAt: now() };
  const copy: Resume = {
    id: uid(),
    title: job.company ? `${job.title} at ${job.company}` : job.title,
    updatedAt: now(),
    pageSize: source.pageSize,
    doc,
    job: context,
    suggestions: tailorSuggestions(doc, context),
  };
  update((s) => ({ ...s, resumes: [copy, ...s.resumes] }));
  return copy.id;
}

export function reviewSuggestion(resumeId: string, suggestion: Suggestion, accept: boolean, text?: string) {
  editResume(resumeId, (r) => {
    const rest = r.suggestions.filter((x) => x.id !== suggestion.id);
    if (!accept) return { ...r, suggestions: rest };
    const doc = structuredClone(r.doc);
    // Apply only if the target still holds the text the suggestion was made for; otherwise mark it stale.
    if (suggestion.kind === "summary" && doc.summary === suggestion.original) {
      doc.summary = text ?? suggestion.proposed;
    } else if (suggestion.kind === "bullet") {
      const bullet = [...doc.experience, ...doc.projects].flatMap((e) => e.bullets).find((b) => b.id === suggestion.bulletId);
      if (bullet?.text !== suggestion.original) return staleIn(r, suggestion);
      bullet.text = text ?? suggestion.proposed;
    } else if (suggestion.kind === "skills" && doc.skills.map((x) => x.name).join() === suggestion.original.join()) {
      doc.skills.sort((a, b) => suggestion.proposed.indexOf(a.name) - suggestion.proposed.indexOf(b.name));
    } else {
      return staleIn(r, suggestion);
    }
    return { ...r, doc, suggestions: rest };
  });
}

const staleIn = (r: Resume, suggestion: Suggestion) => ({
  ...r,
  suggestions: r.suggestions.map((x) => (x.id === suggestion.id ? { ...x, stale: true } : x)),
});

// Paid results are never dropped; an older suggestion for the same target goes stale on accept instead.
export const addSuggestion = (resumeId: string, suggestion: Suggestion) =>
  patch(resumeId, (r) => ({ ...r, suggestions: [suggestion, ...r.suggestions] }));

export const acceptAiDisclosure = () => update((s) => ({ ...s, aiDisclosureAccepted: true }));

export function startPro() {
  update((s) => {
    if (s.plan === "pro") return s;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    return { ...s, plan: "pro", proUsed: 0, cancelAtPeriodEnd: false, periodEnd: periodEnd.toISOString() };
  });
}

export const setCancelAtPeriodEnd = (cancel: boolean) => update((s) => ({ ...s, cancelAtPeriodEnd: cancel }));

/** Demo shortcut for what happens when a canceled Pro period runs out: Free limits, resumes untouched. */
export const endProPeriod = () => update((s) => ({ ...s, plan: "free", cancelAtPeriodEnd: false, periodEnd: "" }));

export function resetDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  write(seed());
}
