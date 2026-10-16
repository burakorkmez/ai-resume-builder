// Resume document contract (plan.md §5). Every repeatable item has a stable id; array order is display order.

export type Bullet = { id: string; text: string };

export type Contact = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
};

export type Experience = {
  id: string;
  role: string;
  employer: string;
  location: string;
  start: string; // YYYY-MM
  end: string;
  current: boolean;
  bullets: Bullet[];
};

export type Education = {
  id: string;
  degree: string;
  field: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  details: string;
};

export type Project = {
  id: string;
  name: string;
  role: string;
  url: string;
  start: string;
  end: string;
  bullets: Bullet[];
};

export type Skill = { id: string; name: string };

export type ResumeDoc = {
  contact: Contact;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
};

export type PageSize = "A4" | "LETTER";

export type JobContext = { title: string; company: string; description: string; tailoredAt: string };

type SuggestionBase = { id: string; reason: string; note?: string; stale?: boolean };
export type Suggestion = SuggestionBase &
  (
    | { kind: "summary"; original: string; proposed: string }
    | { kind: "bullet"; bulletId: string; original: string; proposed: string }
    | { kind: "skills"; original: string[]; proposed: string[] }
  );

export type Resume = {
  id: string;
  title: string;
  updatedAt: string;
  version: number; // bumped by every server save; stale saves are rejected
  pageSize: PageSize;
  doc: ResumeDoc;
  job?: JobContext;
  suggestions: Suggestion[];
};

export type Plan = "free" | "pro";

export const PLANS = {
  free: { name: "Free", resumes: 2, credits: 10 },
  pro: { name: "Pro", resumes: 20, credits: 200 },
} as const;

/** AI credits per action, charged by the server only when a result is delivered. */
export const COST = { bullet: 1, summary: 2, tailor: 5 } as const;

export type Account = {
  plan: Plan;
  freeUsed: number;
  proUsed: number;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
  aiDisclosureAccepted: boolean;
};

export type AppState = Account & { user: { name: string; email: string }; resumes: Resume[] };

export function usage(s: AppState) {
  const plan = PLANS[s.plan];
  const credits = plan.credits - (s.plan === "pro" ? s.proUsed : s.freeUsed);
  return { plan, credits, resumes: s.resumes.length, canCreate: s.resumes.length < plan.resumes };
}

const uid = () => crypto.randomUUID();

/** Fresh ids for every entry, bullet, and skill, so copies never share ids with their source. */
export function reid(doc: ResumeDoc): ResumeDoc {
  const bullets = (list: Bullet[]) => list.map((b) => ({ ...b, id: uid() }));
  return {
    ...structuredClone(doc),
    experience: doc.experience.map((e) => ({ ...e, id: uid(), bullets: bullets(e.bullets) })),
    education: doc.education.map((e) => ({ ...e, id: uid() })),
    projects: doc.projects.map((p) => ({ ...p, id: uid(), bullets: bullets(p.bullets) })),
    skills: doc.skills.map((s) => ({ ...s, id: uid() })),
  };
}

// ponytail: hand-rolled shape checks used by the server before writing; becomes the shared zod schema from
// plan.md §4. Per-field length limits are covered for now by one overall size cap in lib/actions.ts.
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

export const isSuggestions = (v: unknown): v is Suggestion[] => items(v, isSuggestion);

export function isResumeDoc(doc: unknown): doc is ResumeDoc {
  return (
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(value: string) {
  const [year, month] = value.split("-");
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : value;
}

export function formatRange(start: string, end: string, current = false) {
  return [formatMonth(start), current ? "Present" : formatMonth(end)].filter(Boolean).join(" – ");
}

export function emptyDoc(): ResumeDoc {
  return {
    contact: { name: "", headline: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
  };
}

export const sampleImprovedBullet: Bullet = {
  id: "b-onboard",
  text: "Onboard new customers and resolve account issues, from first setup through ongoing support.",
};

export const sampleDoc: ResumeDoc = {
  contact: {
    name: "Elena Ruiz",
    headline: "Customer Success Manager",
    email: "elena.ruiz@example.com",
    phone: "",
    location: "Lisbon, Portugal",
    website: "",
    linkedin: "linkedin.com/in/elena-ruiz",
    github: "",
  },
  summary:
    "Customer success manager with six years in B2B software. Leads onboarding for mid-market accounts, partners with product teams on customer feedback, and writes help content.",
  experience: [
    {
      id: "exp-brightline",
      role: "Customer Success Manager",
      employer: "Brightline Software",
      location: "Lisbon",
      start: "2022-03",
      end: "",
      current: true,
      bullets: [
        { id: "b-portfolio", text: "Manage a portfolio of 45 mid-market accounts with a 96% annual renewal rate." },
        sampleImprovedBullet,
        {
          id: "b-reviews",
          text: "Run quarterly reviews with customer leads and share product feedback with the roadmap team.",
        },
      ],
    },
    {
      id: "exp-tidewater",
      role: "Support Specialist",
      employer: "Tidewater Payments",
      location: "Porto",
      start: "2019-06",
      end: "2022-02",
      current: false,
      bullets: [
        { id: "b-tickets", text: "Answered 60+ tickets a day across email and chat with a 4.8/5 satisfaction score." },
        { id: "b-articles", text: "Wrote 30 help-center articles covering billing and account setup." },
      ],
    },
  ],
  education: [
    {
      id: "edu-porto",
      degree: "B.A.",
      field: "Communication",
      institution: "University of Porto",
      location: "Porto",
      start: "2015-09",
      end: "2019-06",
      current: false,
      details: "",
    },
  ],
  projects: [
    {
      id: "proj-playbook",
      name: "Onboarding playbook",
      role: "Author",
      url: "",
      start: "2023-01",
      end: "2023-04",
      bullets: [
        { id: "b-playbook", text: "Wrote a step-by-step guide for new accounts, adopted by the eight-person success team." },
      ],
    },
  ],
  skills: [
    { id: "s-onboarding", name: "Customer onboarding" },
    { id: "s-accounts", name: "Account management" },
    { id: "s-zendesk", name: "Zendesk" },
    { id: "s-salesforce", name: "Salesforce" },
    { id: "s-sql", name: "SQL basics" },
    { id: "s-languages", name: "English, Portuguese, Spanish" },
  ],
};

export const sampleJob = {
  title: "Senior Customer Success Manager",
  company: "Acme Health",
  description:
    "Acme Health is hiring a Senior Customer Success Manager to own onboarding and renewals for a portfolio of hospital and clinic accounts. You'll run quarterly business reviews, partner with Product on customer feedback, and use Salesforce and SQL to track account health. Experience with Zendesk and customer onboarding in B2B SaaS is a plus.",
};
