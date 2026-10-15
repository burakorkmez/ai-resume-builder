// ponytail: canned stand-in for the Neon AI Gateway (plan.md §8). Swap for POST /api/resumes/[id]/ai.
// Like the real contract, it only reshapes facts already in the resume and never invents numbers.
import type { JobContext, ResumeDoc, Suggestion } from "./resume";

export const COST = { bullet: 1, summary: 2, tailor: 5 } as const;

export const thinking = () => new Promise((resolve) => setTimeout(resolve, 1400));

const canned: Record<string, string> = {
  "Was responsible for onboarding new customers and helping them with problems.":
    "Onboard new customers and resolve account issues, from first setup through ongoing support.",
  "Did quarterly meetings with customers and told the product team what they said.":
    "Run quarterly reviews with customer leads and share their product feedback with the roadmap team.",
};

const missingNumber =
  "Missing detail: add a number (accounts, people, time saved) if you have one. We won't guess it.";

export function improveBullet(text: string) {
  const tidy =
    text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^(i |we )?(was |were )?(responsible for|in charge of|tasked with|helped( to)?|worked on)\s+/i, "")
      .replace(/\b(successfully|various|really|very)\s+/gi, "")
      .replace(/\.+$/, "") + ".";
  const proposed = canned[text] ?? tidy.charAt(0).toUpperCase() + tidy.slice(1);
  return {
    proposed,
    reason: "Leads with what you did and cuts filler words.",
    note: /\d/.test(text) ? undefined : missingNumber,
  };
}

const list = (items: string[]) => new Intl.ListFormat("en").format(items);

export function draftSummary(doc: ResumeDoc, job?: Pick<JobContext, "title">) {
  const role = doc.contact.headline || doc.experience[0]?.role || "Professional";
  const employers = doc.experience.map((e) => e.employer).filter(Boolean).slice(0, 2);
  const skills = doc.skills.slice(0, 3).map((s) => s.name);
  const edu = doc.education[0];
  const proposed = [
    employers.length ? `${role} with experience at ${list(employers)}.` : `${role}.`,
    skills.length && `Skilled in ${list(skills)}.`,
    edu?.institution && `${[edu.degree, edu.field].filter(Boolean).join(" in ")} from ${edu.institution}.`,
    job && `Looking to bring this experience to a ${job.title} role.`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    proposed,
    reason: "Built only from your roles, skills, and education.",
    note: "Missing detail: how many years of experience do you have? Add it if you want it mentioned.",
  };
}

export function tailorSuggestions(doc: ResumeDoc, job: JobContext): Suggestion[] {
  const id = () => crypto.randomUUID();
  const description = job.description.toLowerCase();
  const suggestions: Suggestion[] = [];

  const summary = draftSummary(doc, job);
  suggestions.push({ id: id(), kind: "summary", original: doc.summary, ...summary, reason: `Frames your experience for the ${job.title} role.` });

  for (const bullet of doc.experience[0]?.bullets ?? []) {
    const { proposed, note } = improveBullet(bullet.text);
    if (proposed !== bullet.text && suggestions.length < 3) {
      suggestions.push({ id: id(), kind: "bullet", bulletId: bullet.id, original: bullet.text, proposed, note, reason: "Clearer wording for this role." });
    }
  }

  const names = doc.skills.map((s) => s.name);
  const matched = names.filter((n) => description.includes(n.toLowerCase()));
  const reordered = [...matched, ...names.filter((n) => !matched.includes(n))];
  if (matched.length && reordered.join() !== names.join()) {
    suggestions.push({
      id: id(),
      kind: "skills",
      original: names,
      proposed: reordered,
      reason: `Moves ${list(matched)} up because the job description mentions them. Nothing is added.`,
    });
  }
  return suggestions;
}

export const sampleJob = {
  title: "Senior Customer Success Manager",
  company: "Acme Health",
  description:
    "Acme Health is hiring a Senior Customer Success Manager to own onboarding and renewals for a portfolio of hospital and clinic accounts. You'll run quarterly business reviews, partner with Product on customer feedback, and use Salesforce and SQL to track account health. Experience with Zendesk and customer onboarding in B2B SaaS is a plus.",
};
