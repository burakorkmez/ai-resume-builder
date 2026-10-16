// Client cache of the signed-in user's data. Postgres (via the server actions in ./actions) is the source of
// truth: the cache loads once per page load, edits apply locally right away, and autosave sends each resume
// back after a short pause with the version it was based on, so a stale tab can't overwrite newer work.
import { useSyncExternalStore } from "react";
import * as api from "./actions";
import type { Account, AppState, JobContext, Resume, Suggestion } from "./resume";

export { PLANS, usage } from "./resume";

export type Sync = "saved" | "saving" | "failed" | "conflict";

const listeners = new Set<() => void>();
let state: (AppState & { sync: Sync }) | null = null;
let loading = false;

function write(next: typeof state) {
  state = next;
  listeners.forEach((l) => l());
}

const update = (fn: (s: NonNullable<typeof state>) => NonNullable<typeof state>) => state && write(fn(state));
const setSync = (sync: Sync) => update((s) => (s.sync === "conflict" ? s : { ...s, sync }));
const setAccount = (account: Account) => update((s) => ({ ...s, ...account }));
const patch = (id: string, fn: (r: Resume) => Resume) =>
  update((s) => ({ ...s, resumes: s.resumes.map((r) => (r.id === id ? fn(r) : r)) }));

function load() {
  if (loading) return;
  loading = true;
  api.loadState().then(
    (s) => write({ ...s, sync: "saved" }),
    (e) => {
      loading = false; // the next subscriber retries
      console.error("Couldn't load your data", e);
    },
  );
}

/** null until the first load finishes, including during server render and hydration. */
export function useAppState() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), load(), () => listeners.delete(l)),
    () => state,
    () => null,
  );
}

// --- Autosave ---

const pending = new Map<string, ReturnType<typeof setTimeout>>();
let queue = Promise.resolve();

if (typeof window !== "undefined") {
  addEventListener("beforeunload", (e) => {
    if (pending.size || state?.sync === "saving") e.preventDefault();
  });
}

function schedule(id: string, delay: number) {
  clearTimeout(pending.get(id));
  pending.set(id, setTimeout(() => void flush(id), delay));
}

async function save(id: string) {
  const r = state?.resumes.find((x) => x.id === id);
  if (!r || state?.sync === "conflict") return;
  try {
    const ack = await api.saveResume({ id, title: r.title.trim() || "Untitled resume", pageSize: r.pageSize, doc: r.doc, suggestions: r.suggestions, version: r.version });
    if (!state?.resumes.some((x) => x.id === id)) return; // deleted while saving
    if (!ack) {
      setSync("conflict"); // another tab saved first; keep this draft on screen and stop saving
      return;
    }
    patch(id, (x) => ({ ...x, version: ack.version }));
    if (!pending.size) setSync("saved");
  } catch (e) {
    console.error("Save failed", e);
    setSync("failed");
    if (!pending.has(id)) schedule(id, 3000); // ponytail: retries every 3s while the tab is open; add backoff if it matters
  }
}

/** Sends this resume's unsaved edits now. Resolves false if they couldn't be saved. */
async function flush(id: string) {
  if (pending.has(id)) {
    clearTimeout(pending.get(id));
    pending.delete(id);
    queue = queue.then(() => save(id));
  }
  await queue;
  return !pending.has(id) && state?.sync !== "conflict";
}

export function editResume(id: string, fn: (r: Resume) => Resume) {
  patch(id, (r) => ({ ...fn(r), updatedAt: new Date().toISOString() }));
  setSync("saving");
  schedule(id, 750);
}

// --- Resumes ---

const add = ({ resume, account }: { resume: Resume; account: Account }) =>
  update((s) => ({ ...s, ...account, resumes: [resume, ...s.resumes] }));

/** Returns the new resume's id, or null when there's no free slot. */
export async function createResume() {
  const res = await api.createResume();
  if (typeof res === "string") return null;
  add(res);
  return res.resume.id;
}

export async function duplicateResume(id: string) {
  await flush(id);
  const res = await api.duplicateResume(id);
  if (typeof res === "string") return null;
  add(res);
  return res.resume.id;
}

export const renameResume = (id: string, title: string) => editResume(id, (r) => ({ ...r, title }));

export async function deleteResume(id: string) {
  clearTimeout(pending.get(id));
  pending.delete(id);
  update((s) => ({ ...s, resumes: s.resumes.filter((r) => r.id !== id) }));
  await api.deleteResume(id);
}

// --- AI ---

/** One paid suggestion from the server. Credits are only charged when a result comes back. */
export async function suggest(req: Parameters<typeof api.suggest>[0]) {
  const res = await api.suggest(req);
  if (typeof res !== "string") setAccount(res.account);
  return res;
}

export async function tailorResume(sourceId: string, job: Omit<JobContext, "tailoredAt">) {
  // The server copies the saved version, so make sure it has the latest edits first.
  if (!(await flush(sourceId))) return "unsaved" as const;
  const res = await api.tailorResume(sourceId, job);
  if (typeof res === "string") return res;
  add(res);
  return { id: res.resume.id };
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
  editResume(resumeId, (r) => ({ ...r, suggestions: [suggestion, ...r.suggestions] }));

// --- Account ---

export function acceptAiDisclosure() {
  update((s) => ({ ...s, aiDisclosureAccepted: true }));
  api.acceptAiDisclosure().then(setAccount);
}

// Checkout and the portal are Polar-hosted pages, so these leave the app.
export const startCheckout = () => api.startCheckout().then((url) => location.assign(url));
export const openBillingPortal = () => api.openBillingPortal().then((url) => location.assign(url));
export const refreshBilling = () => api.refreshBilling().then((account) => (setAccount(account), account));
export const setCancelAtPeriodEnd = (cancel: boolean) => api.setCancelAtPeriodEnd(cancel).then(setAccount);
export const deleteAccount = () => api.deleteAccount();
