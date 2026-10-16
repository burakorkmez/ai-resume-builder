"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Dialog } from "@/components/dialog";
import { LogoMark } from "@/components/landing/logo";
import { ResumeDocument } from "@/components/resume-document";
import { button, credits, Field, Sparkle, TextArea, timeAgo } from "@/components/ui";
import { COST, sampleJob, type Bullet, type JobContext, type PageSize, type Resume, type ResumeDoc } from "@/lib/resume";
import { acceptAiDisclosure, addSuggestion, editResume, suggest, tailorResume, usage, useAppState } from "@/lib/store";
import { ResumeForm, sections } from "./form";
import { Review } from "./review";

const blankJob = { title: "", company: "", description: "" };

export function Editor({ id }: { id: string }) {
  const state = useAppState();
  const router = useRouter();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<ReactNode>(null);
  const [dialog, setDialog] = useState<"disclosure" | "tailor" | null>(null);
  const [job, setJob] = useState(blankJob);
  const pending = useRef<(() => void) | null>(null);

  if (!state) return <EditorSkeleton />;
  const resume = state.resumes.find((r) => r.id === id);
  if (!resume) return <NotFound />;
  const u = usage(state);
  const doc = resume.doc;

  const change = (fn: (r: Resume) => Resume) => editResume(id, fn);
  const setDoc = (fn: (d: ResumeDoc) => ResumeDoc) => change((r) => ({ ...r, doc: fn(r.doc) }));

  const outOfCredits = (cost: number) =>
    setNotice(
      <>
        This needs {credits(cost)} and you have {u.credits}.{" "}
        {state.plan === "free" ? (
          <Link href="/billing" className="font-medium underline underline-offset-2">
            Upgrade to Pro
          </Link>
        ) : (
          "Your credits reset at the start of your next billing month."
        )}
      </>,
    );

  // One AI action at a time; the server charges credits only once a result is delivered.
  const ai = (key: string, cost: number, work: () => Promise<"no-credits" | "too-long" | false | void>) => {
    if (busy) return;
    const run = async () => {
      if (u.credits < cost) return outOfCredits(cost);
      setNotice(null);
      setBusy(key);
      try {
        const result = await work();
        if (result === "no-credits") return outOfCredits(cost);
        if (result === "too-long") {
          return setNotice("That's more text than this AI action can take at once. Shorten it (for tailoring, the job description) and try again. You weren't charged.");
        }
        if (result === false) return;
        requestAnimationFrame(() => document.getElementById("review")?.scrollIntoView({ block: "start" }));
      } catch (e) {
        console.error(e);
        setNotice("The AI request didn't go through, and you weren't charged. Please try again.");
      } finally {
        setBusy(null);
      }
    };
    if (state.aiDisclosureAccepted) run();
    else {
      pending.current = run;
      setDialog("disclosure");
    }
  };

  const improve = (bullet: Bullet) =>
    ai(bullet.id, COST.bullet, async () => {
      const holds = (e: { bullets: Bullet[] }) => e.bullets.some((b) => b.id === bullet.id);
      const entry = doc.experience.find(holds) ?? doc.projects.find(holds);
      const context = entry && ("employer" in entry ? [entry.role, entry.employer] : [entry.role, entry.name]).filter(Boolean).join(" · ");
      const res = await suggest({ kind: "bullet", text: bullet.text, context: context || undefined });
      if (typeof res === "string") return res;
      addSuggestion(id, { id: crypto.randomUUID(), kind: "bullet", bulletId: bullet.id, original: bullet.text, ...res.result });
    });

  const summarize = () => {
    if (!doc.experience.length && !doc.education.length && !doc.skills.length) {
      setNotice("Add some experience, education, or skills first so there's something to summarize.");
      return;
    }
    ai("summary", COST.summary, async () => {
      const res = await suggest({ kind: "summary", doc });
      if (typeof res === "string") return res;
      addSuggestion(id, { id: crypto.randomUUID(), kind: "summary", original: doc.summary, ...res.result });
    });
  };

  const tailor = () => {
    const details = { title: job.title.trim(), company: job.company.trim(), description: job.description.trim() };
    setDialog(null);
    ai("tailor", COST.tailor, async () => {
      const res = await tailorResume(id, details);
      if (res === "no-credits" || res === "too-long") return res;
      if (typeof res === "string") {
        setNotice(
          res === "no-slot"
            ? "There's no free resume slot for a tailored copy. Delete a resume or upgrade first."
            : "Your latest edits haven't saved yet, so nothing was tailored. Try again in a moment.",
        );
        return false;
      }
      setJob(blankJob);
      router.push(`/resumes/${res.id}`);
    });
  };

  const download = () => {
    const hasSection = doc.summary.trim() || doc.experience.length || doc.education.length || doc.projects.length || doc.skills.length;
    if (!doc.contact.name.trim() || !hasSection) {
      setNotice("Add your full name and at least one section before downloading.");
      setView("edit");
      return;
    }
    window.print(); // ponytail: browser print-to-PDF stands in for the server PDF export (plan.md §10).
  };

  return (
    <div className="flex-1 bg-slate-50 print:bg-white">
      <style>{`@page { size: ${resume.pageSize === "A4" ? "A4" : "letter"}; margin: 44pt; }`}</style>

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md print:hidden">
        <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <Link href="/dashboard" aria-label="Back to resumes" className={button.icon}>
            <span aria-hidden>←</span>
          </Link>
          <LogoMark className="hidden size-6 sm:block" />
          <input
            aria-label="Resume title"
            value={resume.title}
            maxLength={120}
            onChange={(e) => {
              const title = e.target.value;
              change((r) => ({ ...r, title }));
            }}
            onBlur={(e) => !e.target.value.trim() && change((r) => ({ ...r, title: "Untitled resume" }))}
            className="min-w-0 flex-1 truncate rounded-lg bg-transparent px-2 py-1 font-semibold hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
          />
          <p aria-live="polite" className="hidden text-sm whitespace-nowrap text-slate-500 md:block">
            {
              {
                saving: "Saving…",
                saved: `Saved ${timeAgo(resume.updatedAt)}`,
                failed: "Save failed — retrying…",
                conflict: "Changed in another tab — reload to continue",
              }[state.sync]
            }
          </p>
          <Link href="/billing" className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 lg:flex">
            <Sparkle className="size-3.5 text-indigo-600" /> {credits(u.credits)}
          </Link>
          <button type="button" className={button.ai} disabled={!!busy} onClick={() => setDialog("tailor")} aria-label="Tailor to a job">
            <Sparkle className={`size-3.5 ${busy === "tailor" ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{busy === "tailor" ? "Tailoring…" : "Tailor to a job"}</span>
          </button>
          <button type="button" className={button.primary} onClick={download}>
            <span className="sm:hidden">PDF</span>
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
        <div role="tablist" aria-label="Editor view" className="grid grid-cols-2 border-t border-slate-200 text-sm lg:hidden">
          {(["edit", "preview"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className="py-2.5 font-medium text-slate-500 capitalize aria-selected:text-indigo-600 aria-selected:shadow-[inset_0_-2px] aria-selected:shadow-indigo-600"
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      <div className="lg:grid lg:h-[calc(100svh-4rem)] lg:grid-cols-2">
        <div className={`${view === "edit" ? "" : "hidden"} space-y-4 p-4 sm:p-6 lg:block lg:overflow-y-auto print:hidden`}>
          <nav aria-label="Sections" className="-mx-1 flex gap-1 overflow-x-auto pb-1 text-sm">
            {sections.map((s) => (
              <a key={s} href={`#${s.toLowerCase()}`} className="shrink-0 rounded-full px-3 py-1 text-slate-600 hover:bg-white hover:text-slate-900">
                {s}
              </a>
            ))}
          </nav>

          {notice && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="flex-1">{notice}</p>
              <button type="button" aria-label="Dismiss" onClick={() => setNotice(null)} className="text-amber-700 hover:text-amber-900">
                ×
              </button>
            </div>
          )}

          {resume.job && <JobCard job={resume.job} />}
          <Review resume={resume} />
          <ResumeForm doc={doc} onChange={setDoc} ai={{ busy, improve, summarize }} />
        </div>

        <Preview resume={resume} hidden={view !== "preview"} onPageSize={(pageSize) => change((r) => ({ ...r, pageSize }))} />
      </div>

      <Dialog open={dialog === "disclosure"} onClose={() => setDialog(null)} title="Before you use AI">
        <p>
          To write suggestions, Veyro sends the relevant parts of this resume to OpenAI. Your name, email, phone, address, and
          personal links are left out.
        </p>
        <p className="mt-2">Suggestions only use what you&apos;ve written, and nothing changes until you accept it.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={button.secondary} onClick={() => setDialog(null)}>
            Not now
          </button>
          <button
            type="button"
            className={button.primary}
            onClick={() => {
              acceptAiDisclosure();
              setDialog(null);
              pending.current?.();
              pending.current = null;
            }}
          >
            Continue
          </button>
        </div>
      </Dialog>

      <Dialog open={dialog === "tailor"} onClose={() => setDialog(null)} title="Tailor to a job">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tailor();
          }}
          className="space-y-4"
        >
          <p>Veyro makes a separate copy shaped for this job, with suggestions you review one by one. This resume stays untouched.</p>
          <ul className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs">
            <li>
              Uses 1 resume slot · {u.resumes} of {u.plan.resumes} used
            </li>
            <li>
              Costs {COST.tailor} credits · {u.credits} left
            </li>
          </ul>
          {!u.canCreate && (
            <p role="alert" className="text-xs text-red-600">
              No resume slots left. Delete a resume or{" "}
              <Link href="/billing" className="underline underline-offset-2">
                upgrade to Pro
              </Link>{" "}
              first.
            </p>
          )}
          <Field label="Job title" required maxLength={200} value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} />
          <Field label="Company (optional)" maxLength={200} value={job.company} onChange={(e) => setJob({ ...job, company: e.target.value })} />
          <TextArea
            label="Job description"
            required
            maxLength={15000}
            className="[&_textarea]:max-h-60"
            value={job.description}
            onChange={(e) => setJob({ ...job, description: e.target.value })}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={`${button.ghost} mr-auto px-2`} onClick={() => setJob(sampleJob)}>
              Use a sample job
            </button>
            <button type="button" className={button.secondary} onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button className={button.primary} disabled={!u.canCreate || u.credits < COST.tailor}>
              Tailor · {COST.tailor} credits
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function Preview({ resume, hidden, onPageSize }: { resume: Resume; hidden: boolean; onPageSize: (size: PageSize) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const a4 = resume.pageSize === "A4";
  const width = a4 ? 794 : 816; // 210mm and 8.5in at 96dpi
  const { doc } = resume;
  const empty = !doc.contact.name && !doc.summary && !doc.experience.length && !doc.education.length && !doc.projects.length && !doc.skills.length;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => entry.contentRect.width && setScale(Math.min(1, entry.contentRect.width / width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div className={`${hidden ? "hidden" : ""} bg-slate-200/60 p-4 sm:p-8 lg:block lg:overflow-y-auto print:block print:bg-white print:p-0`}>
      <div className="mx-auto mb-4 flex max-w-[816px] items-center justify-between gap-3 text-sm print:hidden">
        <p className="text-slate-600">Live preview</p>
        <div role="group" aria-label="Page size" className="flex rounded-full bg-white p-0.5 ring-1 ring-slate-200">
          {(["A4", "LETTER"] as const).map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={resume.pageSize === size}
              onClick={() => onPageSize(size)}
              className="rounded-full px-3 py-1 text-slate-600 aria-pressed:bg-slate-900 aria-pressed:text-white"
            >
              {size === "A4" ? "A4" : "US Letter"}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} className="mx-auto max-w-[816px]">
        <div style={{ zoom: scale }} className="print:[zoom:1]!">
          <article
            aria-label="Resume preview"
            className={`mx-auto bg-white p-[44pt] text-[10.5pt] shadow-xl ring-1 shadow-slate-900/10 ring-slate-900/5 print:min-h-0 print:w-auto print:p-0 print:shadow-none print:ring-0 ${a4 ? "min-h-[297mm] w-[210mm]" : "min-h-[11in] w-[8.5in]"}`}
          >
            {empty ? <p className="text-slate-400">Your resume appears here as you fill in the form.</p> : <ResumeDocument doc={doc} />}
          </article>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job }: { job: JobContext }) {
  return (
    <details className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <summary className="flex cursor-pointer items-center gap-2 font-medium">
        <Sparkle className="size-4 text-indigo-600" />
        Tailored for {job.title}
        {job.company && ` at ${job.company}`}
      </summary>
      <p className="mt-3 text-xs text-slate-500">
        Tailored {timeAgo(job.tailoredAt)}. Only you can see this job description, and it&apos;s never printed.
      </p>
      <p className="mt-2 max-h-60 overflow-y-auto text-sm whitespace-pre-wrap text-slate-600">{job.description}</p>
    </details>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex-1 animate-pulse bg-slate-50" aria-busy aria-label="Loading editor">
      <div className="h-16 border-b border-slate-200 bg-white" />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="h-96 rounded-2xl bg-slate-200" />
        <div className="hidden h-[36rem] rounded-sm bg-slate-200 lg:block" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="m-auto max-w-sm p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Resume not found</h1>
      <p className="mt-2 text-slate-600">It may have been deleted, or the link is wrong.</p>
      <Link href="/dashboard" className={`${button.primary} mt-6`}>
        Back to resumes
      </Link>
    </div>
  );
}
