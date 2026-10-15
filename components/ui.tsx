import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50";

export const button = {
  primary: `${base} bg-slate-900 text-white hover:bg-slate-700`,
  secondary: `${base} bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50`,
  ghost: `${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900`,
  danger: `${base} bg-red-600 text-white hover:bg-red-500`,
  ai: `${base} bg-indigo-50 text-indigo-700 hover:bg-indigo-100`,
  icon: "grid size-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30",
};

export const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400";

const labelText = "mb-1 block text-xs font-medium text-slate-600";

export function Field({ label, className = "", ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className={labelText}>{label}</span>
      <input className={input} {...props} />
    </label>
  );
}

export function TextArea({ label, className = "", ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`block ${className}`}>
      <span className={labelText}>{label}</span>
      <textarea className={`${input} field-sizing-content min-h-20`} {...props} />
    </label>
  );
}

export function Sparkle({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`fill-current ${className}`} aria-hidden>
      <path d="M8 0Q8.6 7.4 16 8 8.6 8.6 8 16 7.4 8.6 0 8 7.4 7.4 8 0Z" />
    </svg>
  );
}

export const credits = (n: number) => `${n} credit${n === 1 ? "" : "s"}`;

export function timeAgo(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(minutes) < 60) return minutes > -1 ? "just now" : rtf.format(minutes, "minute");
  if (Math.abs(minutes) < 60 * 24) return rtf.format(Math.round(minutes / 60), "hour");
  return rtf.format(Math.round(minutes / 1440), "day");
}

export function Meter({ label, value, max, hint }: { label: string; value: number; max: number; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">
        {value} <span className="text-base font-normal text-slate-400">/ {max}</span>
      </p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy aria-label="Loading">
      <div className="h-9 w-64 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-200" />
      </div>
      <div className="h-48 rounded-3xl bg-slate-200" />
    </div>
  );
}
