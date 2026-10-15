"use client";

import { useState } from "react";
import { button, input, Sparkle } from "@/components/ui";
import type { Resume, Suggestion } from "@/lib/resume";
import { reviewSuggestion } from "@/lib/store";

const labels = { summary: "Summary", bullet: "Bullet point", skills: "Skill order" };

export function Review({ resume }: { resume: Resume }) {
  const count = resume.suggestions.length;
  if (!count) return null;

  return (
    <section id="review" aria-labelledby="review-title" className="scroll-mt-32 rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100 sm:p-5 lg:scroll-mt-4">
      <h2 id="review-title" className="flex items-center gap-2 font-semibold text-indigo-950">
        <Sparkle className="size-4 text-indigo-600" />
        {count} suggestion{count > 1 ? "s" : ""} to review
      </h2>
      <p className="mt-1 text-sm text-indigo-900/70">Edit the proposed text if you like, then accept or reject each one.</p>
      <div className="mt-4 space-y-3">
        {resume.suggestions.map((s) => (
          <SuggestionCard key={s.id} resumeId={resume.id} suggestion={s} />
        ))}
      </div>
    </section>
  );
}

function SuggestionCard({ resumeId, suggestion: s }: { resumeId: string; suggestion: Suggestion }) {
  const [text, setText] = useState(s.kind === "skills" ? "" : s.proposed);
  const original = s.kind === "skills" ? s.original.join(" · ") : s.original;

  return (
    <article className="rounded-xl bg-white p-4 text-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium tracking-wide text-indigo-700 uppercase">{labels[s.kind]}</p>

      {s.stale && (
        <p role="status" className="mt-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900">
          This part of your resume changed after the suggestion was made, so it wasn&apos;t applied. Copy the text manually if
          you still want it.
        </p>
      )}

      <p className="mt-3 text-xs text-slate-500">Original</p>
      <p className="mt-1 text-slate-500 line-through decoration-slate-300">{original || "(empty)"}</p>

      <p className="mt-3 text-xs text-indigo-700">Suggested</p>
      {s.kind === "skills" ? (
        <p className="mt-1 rounded-lg bg-indigo-50 p-2.5 text-slate-900">{s.proposed.join(" · ")}</p>
      ) : (
        <textarea
          aria-label="Suggested text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`${input} mt-1 field-sizing-content min-h-16 bg-indigo-50/50`}
        />
      )}

      <p className="mt-2 text-xs text-slate-500">{s.reason}</p>
      {s.note && <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">{s.note}</p>}

      <div className="mt-4 flex gap-2">
        {!s.stale && (
          <button
            type="button"
            className={button.primary}
            disabled={s.kind !== "skills" && !text.trim()}
            onClick={() => reviewSuggestion(resumeId, s, true, s.kind === "skills" ? undefined : text.trim())}
          >
            Accept
          </button>
        )}
        <button type="button" className={button.secondary} onClick={() => reviewSuggestion(resumeId, s, false)}>
          {s.stale ? "Dismiss" : "Reject"}
        </button>
      </div>
    </article>
  );
}
