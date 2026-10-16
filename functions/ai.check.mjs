// Offline check for functions/ai.ts: stubs OpenAI with crafted model replies and asserts that only edits to
// existing resume text get through. Run: npm run check:ai
import assert from "node:assert/strict";

process.env.NEON_AUTH_JWKS_URL = "https://auth.invalid/jwks.json";
process.env.NEON_AUTH_BASE_URL = "https://auth.invalid/neondb/auth";
process.env.OPENAI_API_KEY = "test";

let reply;
let sent;
globalThis.fetch = async (url, init) => {
  assert.equal(url, "https://api.openai.com/v1/chat/completions");
  assert.equal(init.headers.authorization, "Bearer test");
  sent = JSON.parse(init.body);
  return Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(reply) } }] });
};
const { bullet, summary, tailor, TooLong } = await import("./ai.ts");

const doc = {
  contact: { name: "Elena Ruiz", headline: "CSM", email: "elena@example.com", phone: "+351 555", location: "Lisbon", website: "", linkedin: "in/elena", github: "" },
  summary: "Old summary.",
  experience: [{ id: "e1", role: "CSM", employer: "Brightline", location: "Lisbon", start: "2022-03", end: "", current: true, bullets: [{ id: "b1", text: "Did onboarding." }] }],
  education: [],
  projects: [],
  skills: [{ id: "s1", name: "Zendesk" }, { id: "s2", name: "SQL" }],
};
const job = { title: "Senior CSM", company: "Acme", description: "SQL first.", tailoredAt: "2026-10-16T00:00:00Z" };
const ok = { summary: "New summary.", summaryReason: "Fits.", bullets: [{ id: "b1", proposed: "Led onboarding.", reason: "Stronger verb." }], skillOrder: ["SQL", "Zendesk"], skillsReason: "SQL first.", missing: "How many accounts?" };

reply = ok;
const s = await tailor(doc, job);
assert.deepEqual(s.map((x) => x.kind), ["summary", "bullet", "skills"]);
assert.equal(s[1].original, "Did onboarding."); // originals come from the resume, not the model
assert.equal(s[0].note, "Missing detail: How many accounts?");
const prompt = JSON.stringify(sent.messages);
for (const secret of ["Elena Ruiz", "elena@example.com", "+351 555", "in/elena"]) assert.ok(!prompt.includes(secret), `prompt leaks ${secret}`);
assert.equal(sent.response_format.json_schema.strict, true);

const rejects = (why) => assert.rejects(tailor(doc, job), /invalid model output/, why).then(() => (reply = ok));
reply = { ...ok, bullets: [{ id: "nope", proposed: "x", reason: "" }] };
await rejects("unknown bullet id");
reply = { ...ok, bullets: [ok.bullets[0], ok.bullets[0]] };
await rejects("duplicate bullet id");
reply = { ...ok, skillOrder: ["SQL", "Zendesk", "Kubernetes"] };
await rejects("invented skill");
reply = { ...ok, skillOrder: ["SQL"] };
await rejects("dropped skill");

reply = { ...ok, summary: "", bullets: [{ id: "b1", proposed: "Did onboarding.", reason: "" }], skillOrder: [] };
assert.deepEqual(await tailor(doc, job), [], "unchanged text produces no suggestions");

reply = { proposed: "Led onboarding for new accounts.", reason: "Action verb.", missing: null };
assert.deepEqual(await bullet("Did onboarding.", "CSM · Brightline"), { proposed: "Led onboarding for new accounts.", reason: "Action verb.", note: undefined });
reply = { proposed: "", reason: "x", missing: null };
await assert.rejects(summary(doc), /invalid model output/, "empty draft");
reply = { proposed: "Software Developer\n\nSummary\nDeveloper at Google.", reason: "x", missing: null };
await assert.rejects(summary(doc), /invalid model output/, "a whole document instead of a summary");
await assert.rejects(tailor(doc, { ...job, description: "x".repeat(40000) }), TooLong, "oversized input never reaches the model");

console.log("ai.check: all assertions passed");
