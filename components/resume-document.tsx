import type { ReactNode } from "react";
import { formatRange, type Bullet, type ResumeDoc } from "@/lib/resume";

// ponytail: HTML version of the fixed professional-v1 template (plan.md §10); PDF export is the browser's
// print-to-PDF. Swap for the shared @react-pdf/renderer document once lib/pdf exists.
// Sizes are in em, so the wrapper's font-size sets the scale: 10.5pt body → 24pt name, 11.5pt headings.
export function ResumeDocument({ doc, highlightId }: { doc: ResumeDoc; highlightId?: string }) {
  const { contact } = doc;
  const contactLine = [contact.location, contact.email, contact.phone, contact.website, contact.linkedin, contact.github].filter(Boolean);

  return (
    <div className="leading-[1.35] text-slate-800">
      {contact.name && <h2 className="text-[2.286em] leading-tight font-bold tracking-tight text-slate-950">{contact.name}</h2>}
      {contact.headline && <p className="mt-[0.15em] text-[1.1em] text-slate-600">{contact.headline}</p>}
      {contactLine.length > 0 && <p className="mt-[0.4em] text-slate-500">{contactLine.join(" · ")}</p>}

      {doc.summary.trim() && (
        <Section title="Summary">
          <p>{doc.summary}</p>
        </Section>
      )}

      {doc.experience.length > 0 && (
        <Section title="Experience">
          {doc.experience.map((e) => (
            <Entry
              key={e.id}
              title={e.role}
              sub={[e.employer, e.location].filter(Boolean).join(", ")}
              dates={formatRange(e.start, e.end, e.current)}
              bullets={e.bullets}
              highlightId={highlightId}
            />
          ))}
        </Section>
      )}

      {doc.education.length > 0 && (
        <Section title="Education">
          {doc.education.map((e) => (
            <Entry
              key={e.id}
              title={[e.degree, e.field].filter(Boolean).join(" in ")}
              sub={[e.institution, e.location].filter(Boolean).join(", ")}
              dates={formatRange(e.start, e.end, e.current)}
            >
              {e.details && <p className="mt-[0.2em]">{e.details}</p>}
            </Entry>
          ))}
        </Section>
      )}

      {doc.projects.length > 0 && (
        <Section title="Projects">
          {doc.projects.map((p) => (
            <Entry key={p.id} title={p.name} sub={p.role} dates={formatRange(p.start, p.end)} bullets={p.bullets} highlightId={highlightId}>
              {p.url && <p className="text-slate-500">{p.url}</p>}
            </Entry>
          ))}
        </Section>
      )}

      {doc.skills.length > 0 && (
        <Section title="Skills">
          <p>{doc.skills.map((s) => s.name).join(" · ")}</p>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-[1.4em]">
      <h3 className="break-after-avoid border-b border-slate-300 pb-[0.15em] text-[1.095em] font-bold tracking-wide text-slate-950 uppercase">
        {title}
      </h3>
      <div className="mt-[0.55em] space-y-[0.75em]">{children}</div>
    </section>
  );
}

function Entry({
  title,
  sub,
  dates,
  bullets = [],
  highlightId,
  children,
}: {
  title: string;
  sub: string;
  dates: string;
  bullets?: Bullet[];
  highlightId?: string;
  children?: ReactNode;
}) {
  const lines = bullets.filter((b) => b.text.trim());
  return (
    <div className="break-inside-avoid">
      <div className="flex justify-between gap-[1em]">
        <p>
          {title && <span className="font-semibold text-slate-950">{title}</span>}
          {title && sub && " · "}
          {sub}
        </p>
        {dates && <p className="shrink-0 text-slate-500">{dates}</p>}
      </div>
      {children}
      {lines.length > 0 && (
        <ul className="mt-[0.25em] list-disc space-y-[0.15em] pl-[1.3em]">
          {lines.map((b) => (
            <li key={b.id} className={b.id === highlightId ? "rounded-sm bg-indigo-50 ring-4 ring-indigo-50" : undefined}>
              {b.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
