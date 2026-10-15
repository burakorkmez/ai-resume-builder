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
  pageSize: PageSize;
  doc: ResumeDoc;
  job?: JobContext;
  suggestions: Suggestion[];
};

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
