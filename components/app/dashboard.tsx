"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@/components/dialog";
import { button, Field, Loading, Meter, Sparkle, timeAgo } from "@/components/ui";
import type { Resume } from "@/lib/resume";
import { createResume, deleteResume, duplicateResume, renameResume, usage, useAppState } from "@/lib/store";
import desk from "@/public/images/scene-desk.jpg";
import walk from "@/public/images/scene-walk.jpg";

export function Dashboard() {
  const state = useAppState();
  const router = useRouter();
  const [limitOpen, setLimitOpen] = useState(false);
  const [renaming, setRenaming] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState<Resume | null>(null);

  if (!state) return <Loading />;
  const u = usage(state);
  const resumes = [...state.resumes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const latest = resumes[0];

  const create = () => {
    const id = createResume();
    if (id) router.push(`/resumes/${id}`);
    else setLimitOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {state.user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-slate-600">Pick up where you left off, or start something new.</p>
        </div>
        <button type="button" onClick={create} className={button.primary}>
          <span aria-hidden>+</span> New resume
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Meter label="Saved resumes" value={u.resumes} max={u.plan.resumes} hint={u.canCreate ? undefined : "You're at your plan's limit."} />
        <Meter
          label="AI credits left"
          value={u.credits}
          max={u.plan.credits}
          hint={state.plan === "pro" ? "Resets each billing month." : "Free credits don't refill."}
        />
        <div className="flex flex-col justify-between rounded-2xl bg-white p-5 ring-1 ring-slate-200">
          <div>
            <p className="text-sm text-slate-500">Plan</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{u.plan.name}</p>
          </div>
          <Link href="/billing" className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">
            {state.plan === "pro" ? "Manage billing →" : "Upgrade to Pro →"}
          </Link>
        </div>
      </div>

      {u.credits === 0 && (
        <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You&apos;re out of AI credits. Editing and PDF downloads still work as usual.
        </p>
      )}

      {latest ? (
        <>
          <Link
            href={`/resumes/${latest.id}`}
            className="group relative mt-8 flex min-h-48 overflow-hidden rounded-3xl bg-slate-900 text-white"
          >
            <div className="relative z-10 flex flex-col justify-center p-8 sm:max-w-md">
              <p className="text-sm text-indigo-200">Continue editing</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{latest.title}</h2>
              <p className="mt-1 text-sm text-slate-300">Edited {timeAgo(latest.updatedAt)}</p>
              <span className="mt-6 text-sm font-medium transition group-hover:translate-x-1">Open editor →</span>
            </div>
            <Image
              src={desk}
              alt=""
              placeholder="blur"
              sizes="(min-width: 640px) 60vw, 100vw"
              className="absolute inset-0 size-full object-cover object-right opacity-40 transition duration-700 group-hover:scale-105 sm:left-auto sm:w-3/5 sm:opacity-100 sm:[mask-image:linear-gradient(to_right,transparent,black_40%)]"
            />
          </Link>

          <h2 className="mt-12 text-lg font-semibold">All resumes</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <li key={r.id} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:shadow-lg hover:shadow-slate-900/5">
                <Link href={`/resumes/${r.id}`} className="flex flex-1 gap-4">
                  <DocIcon />
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{r.title}</h3>
                    <p className="text-sm text-slate-500">Edited {timeAgo(r.updatedAt)}</p>
                    {r.job && (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        <Sparkle className="size-3" /> Tailored{r.job.company ? ` · ${r.job.company}` : ""}
                      </p>
                    )}
                    {r.suggestions.length > 0 && (
                      <p className="mt-2 text-xs text-slate-500">
                        {r.suggestions.length} suggestion{r.suggestions.length > 1 ? "s" : ""} to review
                      </p>
                    )}
                  </div>
                </Link>
                <div className="mt-5 flex gap-1 border-t border-slate-100 pt-3 text-sm">
                  <button type="button" className={button.ghost} onClick={() => setRenaming(r)}>
                    Rename
                  </button>
                  <button type="button" className={button.ghost} onClick={() => duplicateResume(r.id) || setLimitOpen(true)}>
                    Duplicate
                  </button>
                  <button type="button" className={`${button.ghost} ml-auto hover:bg-red-50 hover:text-red-600`} onClick={() => setDeleting(r)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={create}
                className="grid size-full min-h-40 place-items-center rounded-2xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                + New resume
              </button>
            </li>
          </ul>
        </>
      ) : (
        <div className="mt-8 grid items-center gap-8 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 md:grid-cols-2">
          <div className="p-8 sm:p-12">
            <h2 className="text-2xl font-semibold tracking-tight">Your first resume starts here</h2>
            <p className="mt-2 text-slate-600">
              Fill in simple forms and watch it take shape. You can use AI to polish it whenever you like.
            </p>
            <button type="button" onClick={create} className={`${button.primary} mt-6`}>
              Create resume
            </button>
          </div>
          <Image src={walk} alt="" placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="h-72 w-full object-cover md:h-full" />
        </div>
      )}

      <Dialog open={limitOpen} onClose={() => setLimitOpen(false)} title="No resume slots left">
        <p>
          You&apos;re using {u.resumes} of {u.plan.resumes} resumes on {u.plan.name}.{" "}
          {state.plan === "free"
            ? "Delete one to make room, or upgrade to Pro for up to 20."
            : "Delete one to make room for a new one."}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={button.secondary} onClick={() => setLimitOpen(false)}>
            Close
          </button>
          {state.plan === "free" && (
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

function DocIcon() {
  return (
    <svg viewBox="0 0 40 48" className="h-12 w-10 shrink-0" aria-hidden>
      <path d="M4 0h22l14 14v30a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4Z" className="fill-slate-100" />
      <path d="M26 0v10a4 4 0 0 0 4 4h10" className="fill-slate-200" />
      <path d="M8 22h18M8 28h24M8 34h20" className="stroke-slate-300" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
