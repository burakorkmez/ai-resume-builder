"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { button, Field, input, Sparkle, TextArea } from "@/components/ui";
import { COST, type Bullet, type Contact, type Education, type Experience, type Project, type ResumeDoc, type Skill } from "@/lib/resume";

export type AiHandlers = {
  busy: string | null;
  improve: (bullet: Bullet) => void;
  summarize: () => void;
};

export const sections = ["Contact", "Summary", "Experience", "Education", "Projects", "Skills"];

const uid = () => crypto.randomUUID();

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}

export function ResumeForm({
  doc,
  onChange,
  ai,
}: {
  doc: ResumeDoc;
  onChange: (fn: (doc: ResumeDoc) => ResumeDoc) => void;
  ai: AiHandlers;
}) {
  const set = <K extends keyof ResumeDoc>(key: K, value: ResumeDoc[K]) => onChange((d) => ({ ...d, [key]: value }));
  const contact = (key: keyof Contact) => ({
    value: doc.contact[key],
    maxLength: 200,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onChange((d) => ({ ...d, contact: { ...d.contact, [key]: value } }));
    },
  });

  return (
    <div className="space-y-4">
      <FormSection title="Contact">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" autoComplete="name" {...contact("name")} />
          <Field label="Professional headline" placeholder="e.g. Product Designer" {...contact("headline")} />
          <Field label="Email" type="email" autoComplete="email" {...contact("email")} />
          <Field label="Phone" type="tel" autoComplete="tel" {...contact("phone")} />
          <Field label="Location" placeholder="City, Country" {...contact("location")} />
          <Field label="Website" type="url" placeholder="https://" {...contact("website")} />
          <Field label="LinkedIn" placeholder="linkedin.com/in/you" {...contact("linkedin")} />
          <Field label="GitHub" placeholder="github.com/you" {...contact("github")} />
        </div>
      </FormSection>

      <FormSection
        title="Summary"
        action={
          <AiButton
            label={doc.summary.trim() ? "Rewrite" : "Write with AI"}
            cost={COST.summary}
            busy={ai.busy === "summary"}
            disabled={!!ai.busy}
            onClick={ai.summarize}
          />
        }
      >
        <TextArea
          label="Professional summary"
          value={doc.summary}
          maxLength={2000}
          placeholder="Two or three sentences about your experience and strengths."
          onChange={(e) => set("summary", e.target.value)}
        />
      </FormSection>

      <FormSection title="Experience">
        <EntryList<Experience>
          noun="Position"
          items={doc.experience}
          onChange={(items) => set("experience", items)}
          blank={() => ({ id: uid(), role: "", employer: "", location: "", start: "", end: "", current: false, bullets: [{ id: uid(), text: "" }] })}
        >
          {(e, patch) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role" value={e.role} maxLength={200} onChange={(x) => patch({ role: x.target.value })} />
                <Field label="Employer" value={e.employer} maxLength={200} onChange={(x) => patch({ employer: x.target.value })} />
                <Field label="Location" className="sm:col-span-2" value={e.location} maxLength={200} onChange={(x) => patch({ location: x.target.value })} />
                <Dates item={e} patch={patch} currentLabel="I currently work here" />
              </div>
              <Bullets bullets={e.bullets} onChange={(bullets) => patch({ bullets })} ai={ai} />
            </>
          )}
        </EntryList>
      </FormSection>

      <FormSection title="Education">
        <EntryList<Education>
          noun="School"
          items={doc.education}
          onChange={(items) => set("education", items)}
          blank={() => ({ id: uid(), degree: "", field: "", institution: "", location: "", start: "", end: "", current: false, details: "" })}
        >
          {(e, patch) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Institution" className="sm:col-span-2" value={e.institution} maxLength={200} onChange={(x) => patch({ institution: x.target.value })} />
              <Field label="Degree" placeholder="e.g. B.Sc." value={e.degree} maxLength={200} onChange={(x) => patch({ degree: x.target.value })} />
              <Field label="Field of study" value={e.field} maxLength={200} onChange={(x) => patch({ field: x.target.value })} />
              <Field label="Location" className="sm:col-span-2" value={e.location} maxLength={200} onChange={(x) => patch({ location: x.target.value })} />
              <Dates item={e} patch={patch} currentLabel="I currently study here" />
              <TextArea label="Details (optional)" className="sm:col-span-2" placeholder="Honors, thesis, relevant coursework" value={e.details} maxLength={1000} onChange={(x) => patch({ details: x.target.value })} />
            </div>
          )}
        </EntryList>
      </FormSection>

      <FormSection title="Projects">
        <EntryList<Project>
          noun="Project"
          items={doc.projects}
          onChange={(items) => set("projects", items)}
          blank={() => ({ id: uid(), name: "", role: "", url: "", start: "", end: "", bullets: [{ id: uid(), text: "" }] })}
        >
          {(p, patch) => (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Project name" value={p.name} maxLength={200} onChange={(x) => patch({ name: x.target.value })} />
                <Field label="Your role" value={p.role} maxLength={200} onChange={(x) => patch({ role: x.target.value })} />
                <Field label="Link (optional)" type="url" placeholder="https://" className="sm:col-span-2" value={p.url} maxLength={2048} onChange={(x) => patch({ url: x.target.value })} />
                <Dates item={p} patch={patch} />
              </div>
              <Bullets bullets={p.bullets} onChange={(bullets) => patch({ bullets })} ai={ai} />
            </>
          )}
        </EntryList>
      </FormSection>

      <FormSection title="Skills">
        <Skills skills={doc.skills} onChange={(skills) => set("skills", skills)} />
      </FormSection>
    </div>
  );
}

function FormSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  const id = title.toLowerCase();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6 lg:scroll-mt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="font-semibold">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AiButton({
  label,
  cost,
  busy,
  disabled,
  onClick,
  small,
}: {
  label: string;
  cost: number;
  busy: boolean;
  disabled?: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label}, costs ${cost} credit${cost > 1 ? "s" : ""}`}
      className={`${button.ai} ${small ? "px-2.5 py-1 text-xs" : ""}`}
    >
      <Sparkle className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Thinking…" : label}
      <span className="text-indigo-600">· {cost}</span>
    </button>
  );
}

function Reorder({
  label,
  index,
  count,
  onMove,
  onRemove,
  inline,
}: {
  label: string;
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  inline?: boolean;
}) {
  const size = inline ? `${button.icon} size-6` : button.icon;
  return (
    <div className="flex">
      <button type="button" className={size} aria-label={`Move ${label} ${inline ? "earlier" : "up"}`} disabled={index === 0} onClick={() => onMove(index - 1)}>
        <span aria-hidden>{inline ? "←" : "↑"}</span>
      </button>
      <button type="button" className={size} aria-label={`Move ${label} ${inline ? "later" : "down"}`} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
        <span aria-hidden>{inline ? "→" : "↓"}</span>
      </button>
      <button type="button" className={`${size} hover:bg-red-50 hover:text-red-600`} aria-label={`Remove ${label}`} onClick={onRemove}>
        <span aria-hidden>×</span>
      </button>
    </div>
  );
}

function EntryList<T extends { id: string }>({
  noun,
  items,
  onChange,
  blank,
  children,
}: {
  noun: string;
  items: T[];
  onChange: (items: T[]) => void;
  blank: () => T;
  children: (item: T, patch: (p: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.id} role="group" aria-label={`${noun} ${i + 1}`} className="rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              {noun} {i + 1}
            </p>
            <Reorder
              label={`${noun.toLowerCase()} ${i + 1}`}
              index={i}
              count={items.length}
              onMove={(to) => onChange(move(items, i, to))}
              onRemove={() => onChange(items.filter((x) => x.id !== item.id))}
            />
          </div>
          {children(item, (p) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...p } : x))))}
        </div>
      ))}
      <button type="button" className={button.secondary} onClick={() => onChange([...items, blank()])}>
        + Add {noun.toLowerCase()}
      </button>
    </div>
  );
}

type DateFields = { start: string; end: string; current?: boolean };

function Dates({ item, patch, currentLabel }: { item: DateFields; patch: (p: Partial<DateFields>) => void; currentLabel?: string }) {
  const backwards = !item.current && item.start && item.end && item.end < item.start;
  return (
    <>
      <Field label="Start" type="month" value={item.start} onChange={(e) => patch({ start: e.target.value })} />
      <Field
        label="End"
        type="month"
        value={item.current ? "" : item.end}
        min={item.start || undefined}
        disabled={item.current}
        aria-invalid={!!backwards}
        onChange={(e) => patch({ end: e.target.value })}
      />
      {backwards && (
        <p role="alert" className="text-xs text-red-600 sm:col-span-2">
          The end date is before the start date.
        </p>
      )}
      {currentLabel && (
        <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
          <input type="checkbox" className="size-4 accent-indigo-600" checked={item.current} onChange={(e) => patch({ current: e.target.checked })} />
          {currentLabel}
        </label>
      )}
    </>
  );
}

function Bullets({ bullets, onChange, ai }: { bullets: Bullet[]; onChange: (bullets: Bullet[]) => void; ai: AiHandlers }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-medium text-slate-600">Bullet points</p>
      <ul className="space-y-3">
        {bullets.map((b, i) => (
          <li key={b.id}>
            <textarea
              aria-label={`Bullet ${i + 1}`}
              value={b.text}
              maxLength={1000}
              rows={2}
              placeholder="What did you do, and what changed because of it?"
              onChange={(e) => {
                const text = e.target.value;
                onChange(bullets.map((x) => (x.id === b.id ? { ...x, text } : x)));
              }}
              className={`${input} field-sizing-content min-h-16`}
            />
            <div className="mt-1 flex items-center">
              <AiButton
                small
                label="Improve"
                cost={COST.bullet}
                busy={ai.busy === b.id}
                disabled={!!ai.busy || !b.text.trim()}
                onClick={() => ai.improve(b)}
              />
              <div className="ml-auto">
                <Reorder
                  label={`bullet ${i + 1}`}
                  index={i}
                  count={bullets.length}
                  onMove={(to) => onChange(move(bullets, i, to))}
                  onRemove={() => onChange(bullets.filter((x) => x.id !== b.id))}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {bullets.length < 12 && (
        <button type="button" className={`${button.ghost} mt-2 px-2`} onClick={() => onChange([...bullets, { id: uid(), text: "" }])}>
          + Add bullet
        </button>
      )}
    </div>
  );
}

function Skills({ skills, onChange }: { skills: Skill[]; onChange: (skills: Skill[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const name = draft.trim();
    if (name && !skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) onChange([...skills, { id: uid(), name }]);
    setDraft("");
  };

  return (
    <>
      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <li key={s.id} className="flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pr-1 pl-3 text-sm">
              {s.name}
              <Reorder
                inline
                label={s.name}
                index={i}
                count={skills.length}
                onMove={(to) => onChange(move(skills, i, to))}
                onRemove={() => onChange(skills.filter((x) => x.id !== s.id))}
              />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <input
          aria-label="New skill"
          className={input}
          value={draft}
          maxLength={200}
          placeholder="Add a skill and press Enter"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className={button.secondary} onClick={add} disabled={skills.length >= 80}>
          Add
        </button>
      </div>
    </>
  );
}
