"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@/components/dialog";
import { ResumeDocument } from "@/components/resume-document";
import { button, Field, Loading, Sparkle, timeAgo } from "@/components/ui";
import type { Resume } from "@/lib/resume";
import { createResume, deleteResume, duplicateResume, renameResume, usage, useAppState } from "@/lib/store";
import walk from "@/public/images/scene-walk.jpg";

export function Dashboard() {
  const state = useAppState();
  const router = useRouter();
  const [limitOpen, setLimitOpen] = useState(false);
  const [renaming, setRenaming] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState<Resume | null>(null);

  if (!state) return <Loading />;
  const u = usage(state);
  const pro = state.plan === "pro";
  const resumes = [...state.resumes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const firstName = state.user.name.split(" ")[0];

  const create = async () => {
    const id = await createResume();
    if (id) router.push(`/resumes/${id}`);
    else setLimitOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {resumes.length ? "Welcome back" : "Welcome"}
            {firstName && `, ${firstName}`}
          </h1>
          <p className="mt-1 text-slate-600">
            {resumes.length ? "Pick up where you left off, or start something new." : "Let's put your first resume together."}
          </p>
        </div>
        <button type="button" onClick={create} className={button.primary}>
          <PlusIcon /> New resume
        </button>
      </div>

      <section
        aria-label="Plan and usage"
        className="mt-8 grid gap-x-10 gap-y-5 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:grid-cols-2 sm:p-6 lg:grid-cols-[auto_1fr_1fr_auto] lg:items-center"
      >
        <div>
          <p className="text-sm text-slate-600">Current plan</p>
          <p className="mt-0.5 flex items-center gap-2 text-lg font-semibold text-slate-900">
            {u.plan.name}
            {pro && <Sparkle className="size-4 text-indigo-600" />}
          </p>
        </div>
        <Link href="/billing" className={`${pro ? button.secondary : button.ai} justify-self-start sm:justify-self-end lg:order-last`}>
          {pro ? "Manage billing" : "Upgrade to Pro"}
        </Link>
        <Usage label="Resumes" value={u.resumes} max={u.plan.resumes} note={u.canCreate ? `${u.plan.resumes - u.resumes} left` : "Limit reached"} />
        <Usage
          label="AI credits left"
          value={u.credits}
          max={u.plan.credits}
          note={u.credits === 0 ? "None left" : pro ? "Resets monthly" : "One-time grant"}
        />
      </section>

      {u.credits === 0 && (
        <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You&apos;re out of AI credits. Editing and PDF downloads still work as usual.
        </p>
      )}

      {resumes.length ? (
        <section aria-labelledby="resumes-title" className="mt-10">
          <h2 id="resumes-title" className="flex items-baseline gap-2 text-lg font-semibold text-slate-900">
            Your resumes <span className="text-sm font-normal text-slate-600">· most recent first</span>
          </h2>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <ResumeCard
                key={r.id}
                resume={r}
                onRename={() => setRenaming(r)}
                onDuplicate={async () => (await duplicateResume(r.id)) || setLimitOpen(true)}
                onDelete={() => setDeleting(r)}
              />
            ))}
            <li>
              <button
                type="button"
                onClick={create}
                className="flex size-full min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 transition hover:border-indigo-400 hover:bg-white hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <span className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-slate-200">
                  <PlusIcon />
                </span>
                <span className="font-medium">New resume</span>
                {!u.canCreate && <span>All {u.plan.resumes} slots on {u.plan.name} are in use</span>}
              </button>
            </li>
          </ul>
        </section>
      ) : (
        <section className="mt-10 grid overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 md:h-80 md:grid-cols-2 md:grid-rows-1">
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Your first resume starts here</h2>
            <p className="mt-2 text-slate-600">Fill in simple forms and watch it take shape. Use AI to polish it whenever you like.</p>
            <button type="button" onClick={create} className={`${button.primary} mt-6 self-start`}>
              <PlusIcon /> Create resume
            </button>
          </div>
          <Image src={walk} alt="" placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="h-56 w-full object-cover md:h-full" />
        </section>
      )}

      <Dialog open={limitOpen} onClose={() => setLimitOpen(false)} title="No resume slots left">
        <p>
          You&apos;re using {u.resumes} of {u.plan.resumes} resumes on {u.plan.name}.{" "}
          {pro ? "Delete one to make room for a new one." : "Delete one to make room, or upgrade to Pro for up to 20."}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={button.secondary} onClick={() => setLimitOpen(false)}>
            Close
          </button>
          {!pro && (
            <Link href="/billing" className={button.primary}>
              See Pro
            </Link>
          )}
        </div>
      </Dialog>

      <Dialog open={!!renaming} onClose={() => setRenaming(null)} title="Rename resume">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const title = String(new FormData(e.currentTarget).get("title")).trim();
            if (renaming && title) renameResume(renaming.id, title);
            setRenaming(null);
          }}
        >
          <Field key={renaming?.id} label="Title" name="title" defaultValue={renaming?.title} required maxLength={120} autoFocus />
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className={button.secondary} onClick={() => setRenaming(null)}>
              Cancel
            </button>
            <button className={button.primary}>Save</button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!deleting} onClose={() => setDeleting(null)} title={`Delete “${deleting?.title ?? ""}”?`}>
        <p>
          This permanently deletes the resume and its pending suggestions. It can&apos;t be undone, and AI credits
          aren&apos;t refunded. Tailored copies made from it are kept.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={button.secondary} onClick={() => setDeleting(null)}>
            Cancel
          </button>
          <button
            type="button"
            className={button.danger}
            onClick={() => {
              if (deleting) deleteResume(deleting.id);
              setDeleting(null);
            }}
          >
            Delete resume
          </button>
        </div>
      </Dialog>
    </>
  );
}

function Usage({ label, value, max, note }: { label: string; value: number; max: number; note: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-600 tabular-nums">
          <span className="font-semibold text-slate-900">{value}</span> of {max}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} of ${max}`}
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-slate-600">{note}</p>
    </div>
  );
}

function ResumeCard({
  resume: r,
  onRename,
  onDuplicate,
  onDelete,
}: {
  resume: Resume;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const menu = `menu-${r.id}`;
  const review = r.suggestions.length;
  // The title link stretches over the whole card (after:inset-0); the menu sits above it (z-10).
  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:shadow-lg hover:shadow-slate-900/5 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-indigo-600">
      <Thumbnail resume={r} />
      <div className="flex items-start gap-2 p-4 pr-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-slate-900">
            <Link href={`/resumes/${r.id}`} className="outline-none after:absolute after:inset-0">
              {r.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-slate-600">Edited {timeAgo(r.updatedAt)}</p>
          {(r.job || review > 0) && (
            <p className="mt-3 flex flex-wrap gap-1.5 text-xs font-medium">
              {r.job && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                  <Sparkle className="size-3" /> Tailored{r.job.company && ` · ${r.job.company}`}
                </span>
              )}
              {review > 0 && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                  {review} suggestion{review > 1 ? "s" : ""} to review
                </span>
              )}
            </p>
          )}
        </div>
        <button type="button" popoverTarget={menu} aria-label={`Actions for ${r.title}`} className={`${button.icon} relative z-10 size-9 text-slate-600`}>
          <DotsIcon />
        </button>
        {/* Native popover: light dismiss, Esc, and focus order for free. Anchored under its button where CSS
            anchor positioning is supported; otherwise the browser centers it on screen. */}
        <div
          id={menu}
          popover="auto"
          className="w-44 rounded-xl bg-white p-1.5 text-sm text-slate-700 shadow-xl ring-1 shadow-slate-900/10 ring-slate-200 supports-[position-area:bottom]:inset-auto supports-[position-area:bottom]:mt-1 supports-[position-area:bottom]:[position-area:bottom_span-left] supports-[position-area:bottom]:[position-try-fallbacks:flip-block]"
        >
          <MenuItem menu={menu} onClick={onRename}>
            Rename
          </MenuItem>
          <MenuItem menu={menu} onClick={onDuplicate}>
            Duplicate
          </MenuItem>
          <MenuItem menu={menu} onClick={onDelete} danger>
            Delete
          </MenuItem>
        </div>
      </div>
    </li>
  );
}

function MenuItem({ menu, onClick, danger, children }: { menu: string; onClick: () => void; danger?: boolean; children: string }) {
  return (
    <button
      type="button"
      popoverTarget={menu}
      popoverTargetAction="hide"
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-600 ${
        danger ? "text-red-700 hover:bg-red-50" : "hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

/** The resume's actual first page, shrunk to card size. Decorative: the card title names it. */
function Thumbnail({ resume: { doc } }: { resume: Resume }) {
  const blank = !doc.contact.name && !doc.summary && !doc.experience.length && !doc.education.length && !doc.projects.length && !doc.skills.length;
  return (
    <div aria-hidden inert className="h-44 overflow-hidden border-b border-slate-200 bg-slate-100 pt-5">
      <div
        style={{ zoom: 0.28 }}
        className="mx-auto min-h-[1123px] w-[794px] bg-white p-[58px] text-[14px] shadow-[0_8px_30px_rgb(15_23_42/0.12)] transition duration-300 motion-safe:group-hover:-translate-y-6"
      >
        {blank ? (
          <div className="space-y-6">
            <div className="h-12 w-1/2 rounded bg-slate-200" />
            <div className="h-5 w-1/3 rounded bg-slate-100" />
            <div className="h-5 w-full rounded bg-slate-100" />
            <div className="h-5 w-5/6 rounded bg-slate-100" />
          </div>
        ) : (
          <ResumeDocument doc={doc} />
        )}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 fill-current" aria-hidden>
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}
