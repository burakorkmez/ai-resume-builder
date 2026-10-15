import { ResumeDocument } from "@/components/resume-document";
import { Sparkle } from "@/components/ui";
import { sampleDoc, sampleImprovedBullet } from "@/lib/resume";

export function SampleResume() {
  return (
    <article
      aria-label="Sample resume"
      className="w-full overflow-hidden rounded-sm bg-white p-7 text-[10.5px] shadow-2xl ring-1 shadow-slate-900/10 ring-slate-900/5 sm:aspect-[1/1.414] sm:p-11 sm:text-[12px]"
    >
      <ResumeDocument doc={sampleDoc} highlightId={sampleImprovedBullet.id} />
    </article>
  );
}

export function SuggestionCard() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-sm shadow-2xl ring-1 shadow-indigo-950/15 ring-slate-900/5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-medium text-slate-900">
          <Sparkle className="size-3.5 text-indigo-600" /> Improve bullet
        </p>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          1 credit
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">Original</p>
      <p className="mt-1 text-slate-500 line-through decoration-slate-300">
        Was responsible for onboarding new customers and helping them with problems.
      </p>

      <p className="mt-3 text-xs font-medium text-indigo-700">Suggested</p>
      <p className="mt-1 rounded-lg bg-indigo-50 p-2.5 text-slate-900">{sampleImprovedBullet.text}</p>

      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
        <span className="font-medium">Missing detail:</span> how many accounts did you onboard? Add
        a number if you have one. We won&apos;t guess it.
      </p>

      <div className="mt-4 flex gap-2" aria-hidden>
        <span className="flex-1 rounded-full bg-slate-900 py-2 text-center font-medium text-white">
          Accept
        </span>
        <span className="rounded-full px-4 py-2 font-medium text-slate-600 ring-1 ring-slate-200">
          Edit
        </span>
        <span className="rounded-full px-4 py-2 font-medium text-slate-600 ring-1 ring-slate-200">
          Reject
        </span>
      </div>
    </div>
  );
}
