import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { Logo } from "@/components/landing/logo";
import { LoopVideo } from "@/components/landing/loop-video";
import { SampleResume, SuggestionCard } from "@/components/landing/sample-resume";
import { SUPPORT_EMAIL } from "@/components/ui";
import hill from "@/public/images/scene-hill.jpg";
import laptop from "@/public/images/scene-laptop.jpg";
import lying from "@/public/images/scene-lying.jpg";
import notes from "@/public/images/scene-notes.jpg";
import walk from "@/public/images/scene-walk.jpg";

const facts = [
  ["10", "free AI credits to start"],
  ["$0", "to sign up, no card needed"],
  ["∞", "watermark-free PDF downloads"],
  ["3", "AI tools: bullets, summaries, tailoring"],
];

const why = [
  ["One template, done right", "A clean, single-column design. No fiddling with fonts, columns, or margins."],
  ["Facts in, polish out", "The AI rewrites what you give it. It never invents metrics, titles, or credentials."],
  ["Yours to keep", "Edit and download every resume you make, even if you never pay."],
];

const actions = [
  {
    title: "Improve a bullet",
    cost: "1 credit",
    text: "Turn a vague line into a clear, specific one, using only what you already wrote. Missing details come back as notes, not guesses.",
    image: notes,
    alt: "The astronaut writing a note in the margin of a book",
  },
  {
    title: "Write your summary",
    cost: "2 credits",
    text: "Draft a concise professional summary from your experience, education, projects, and skills, then make it yours.",
    image: laptop,
    alt: "The astronaut typing on a laptop under the Milky Way, a cat asleep beside him",
  },
];

const tailoring = [
  "Your original resume stays untouched",
  "Skills are reordered, never invented",
  "Dates, employers, and job titles never change",
  "The job description is saved privately with the copy",
];

const principles = [
  ["Only your facts", "No invented metrics, titles, tools, or credentials. Gaps are flagged as notes for you to fill."],
  ["You stay in control", "Edit, accept, or reject every suggestion, one at a time."],
  ["Unlimited PDF downloads", "Watermark-free, automatically paginated, on every plan."],
  ["Works on your phone", "Create, edit, tailor, and export from any screen size. Everything autosaves."],
];

const steps = [
  ["Sign in with Google", "One click to get started. No credit card, no long forms before you can try it."],
  [
    "Add your experience",
    "Simple forms for contact details, summary, experience, education, projects, and skills. Everything autosaves while the preview updates live.",
  ],
  [
    "Polish with AI, if you want",
    "Improve a bullet, draft a summary, or tailor to a job. See each proposal next to your original with a short reason, then accept, edit, or reject.",
  ],
  ["Download your PDF", "A clean template with automatic page breaks. Download as often as you like, on any plan."],
];

const privacy = [
  ["Private by default", "No public links or shared profiles. Only you can open your resumes."],
  ["Minimal AI data", "Your name, email, phone, address, and links are never sent to the AI."],
  ["Nothing stored as files", "PDFs are generated when you download them, never kept on our servers."],
  ["Delete anytime", "Remove a resume or your whole account. Deleting your account also stops future charges."],
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "2 saved resumes",
      "10 AI credits, one time",
      "Unlimited watermark-free PDFs",
      "Job tailoring included",
    ],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    features: [
      "20 saved resumes",
      "200 AI credits every billing month",
      "Unlimited watermark-free PDFs",
      "Cancel anytime from the billing portal",
    ],
    cta: "Go Pro",
  },
];

const faqs = [
  [
    "Will the AI make things up?",
    "No. Veyro only rewrites what you've provided. If a stronger bullet needs a number or detail you haven't given, you'll see a note asking for it instead of a made-up placeholder.",
  ],
  [
    "Does Veyro guarantee interviews or ATS scores?",
    "No, and no tool honestly can. Veyro helps you present your real experience clearly. The hiring decision is still a human one.",
  ],
  [
    "Is there a free trial of Pro?",
    "There's no separate trial. The Free plan includes 10 AI credits and every feature, so you can try the whole workflow before upgrading.",
  ],
  [
    "What happens to my resumes if I cancel Pro?",
    "Pro stays active until the end of your paid period. After that, every resume you've made remains editable and downloadable; you just can't create new ones above the free limit.",
  ],
  [
    "Do unused credits roll over?",
    "Pro credits reset each billing month and don't roll over. Your original 10 free credits are kept separately for if you ever return to Free.",
  ],
  [
    "Can I use Veyro on my phone?",
    "Yes. Creating, editing, AI suggestions, billing, and PDF export all work on mobile, with an Edit / Preview switch on small screens.",
  ],
];

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 fill-indigo-600" aria-hidden>
      <path d="M8.2 13.6 4.6 10l-1.2 1.2 4.8 4.8 9-9-1.2-1.2z" />
    </svg>
  );
}

function Credits({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
      {children}
    </span>
  );
}

function Scene({ src, alt, className = "" }: { src: StaticImageData; alt: string; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      sizes="(min-width: 1024px) 560px, 100vw"
      className={`w-full rounded-3xl object-cover shadow-2xl shadow-slate-900/15 ${className}`}
    />
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  text?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-sm font-medium text-indigo-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-lg text-slate-600">{text}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      <main>
        <section className="border-b border-slate-200 px-4 py-14">
          <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {facts.map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse items-center text-center">
                <dt className="mt-2 max-w-44 text-sm text-slate-500">{label}</dt>
                <dd className="text-4xl font-semibold tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="px-4 py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionIntro
                align="left"
                eyebrow="Why Veyro"
                title="Job hunting is noisy. Your resume shouldn't be."
                text="No template overload, no fake scores, no upsells in your document. Just simple forms, one professional design, and an AI that only works with what you've actually done."
              />
              <ul className="mt-10 space-y-5">
                {why.map(([title, text]) => (
                  <li key={title} className="flex gap-3">
                    <Check />
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-900">{title}.</span> {text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <Scene
              src={walk}
              alt="An astronaut walking through a flower meadow at dusk with a book under his arm, a cat beside him"
              className="aspect-4/5"
            />
          </div>
        </section>

        <section id="sample" className="scroll-mt-8 bg-slate-50 px-4 py-24 sm:py-32">
          <SectionIntro
            eyebrow="See it in action"
            title="One clean template. Your words, sharpened."
            text="Fill in simple forms and watch a professional, one-column resume take shape. When a line could be stronger, ask for a suggestion and review it side by side."
          />
          <div className="relative mx-auto mt-16 flex max-w-[60rem] flex-col items-center gap-8 lg:block">
            <div className="w-full max-w-xl lg:ml-8">
              <SampleResume />
            </div>
            <div className="lg:absolute lg:top-[30%] lg:right-0">
              <SuggestionCard />
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-8 px-4 py-24 sm:py-32">
          <SectionIntro
            eyebrow="AI that works for you"
            title="Help when you want it. Never in your way."
            text="Every AI action shows its cost up front. Editing and PDF export never need credits."
          />
          <div className="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-2">
            <article className="overflow-hidden rounded-3xl bg-slate-900 text-white md:col-span-2 lg:grid lg:grid-cols-5">
              <div className="relative aspect-video lg:col-span-3 lg:aspect-auto lg:min-h-104">
                <LoopVideo
                  src="/videos/desk.mp4"
                  poster="/images/scene-desk.jpg"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <div className="p-8 lg:col-span-2 lg:p-10">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-indigo-200">
                  5 credits
                </span>
                <h3 className="mt-5 text-2xl font-semibold">Tailor to a job</h3>
                <p className="mt-3 text-slate-300">
                  Paste a job description and get a separate copy shaped for that role, with
                  suggestions you review one by one.
                </p>
                <ul className="mt-6 space-y-3 text-slate-200 [&_svg]:fill-indigo-400">
                  {tailoring.map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {actions.map((a) => (
              <article key={a.title} className="overflow-hidden rounded-3xl border border-slate-200">
                <Image
                  src={a.image}
                  alt={a.alt}
                  placeholder="blur"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-4/3 w-full object-cover"
                />
                <div className="p-8">
                  <Credits>{a.cost}</Credits>
                  <h3 className="mt-5 text-xl font-semibold">{a.title}</h3>
                  <p className="mt-2 text-slate-600">{a.text}</p>
                </div>
              </article>
            ))}
          </div>

          <ul className="mx-auto mt-16 grid max-w-5xl gap-x-8 gap-y-6 sm:grid-cols-2">
            {principles.map(([title, text]) => (
              <li key={title} className="flex gap-3">
                <Check />
                <p className="text-slate-600">
                  <span className="font-medium text-slate-900">{title}.</span> {text}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="how" className="scroll-mt-8 bg-slate-50 px-4 py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
            <Scene
              src={hill}
              alt="An astronaut standing on a flowered hilltop at sunset, a laptop under his arm and a cat at his feet"
              className="order-last aspect-4/5 self-start lg:sticky lg:top-8 lg:order-first"
            />
            <div className="lg:py-8">
              <SectionIntro align="left" eyebrow="How it works" title="From blank page to PDF in four steps." />
              <ol className="mt-12 space-y-10">
                {steps.map(([title, text], i) => (
                  <li key={title} className="flex gap-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white font-mono text-sm text-indigo-600 ring-1 ring-slate-200">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="mt-2 text-slate-600">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href="/auth/sign-in"
                className="mt-12 inline-block rounded-full bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700"
              >
                Create your resume <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-8 px-4 py-24 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionIntro
                align="left"
                eyebrow="Privacy"
                title="Your resume stays yours."
                text="It holds your whole working life. We treat it that way."
              />
              <dl className="mt-10 grid gap-8 sm:grid-cols-2">
                {privacy.map(([title, text]) => (
                  <div key={title}>
                    <dt className="font-medium">{title}</dt>
                    <dd className="mt-2 text-slate-600">{text}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <Scene
              src={lying}
              alt="An astronaut lying in a bed of flowers reading a book, a cat asleep on his chest"
              className="aspect-4/5"
            />
          </div>
        </section>

        <section id="pricing" className="scroll-mt-8 bg-slate-50 px-4 py-24 sm:py-32">
          <SectionIntro
            eyebrow="Pricing"
            title="Start free. Upgrade when you're applying a lot."
            text="Bullet improvements cost 1 credit, summaries 2, and job tailoring 5."
          />
          <div className="mx-auto mt-16 grid max-w-3xl gap-4 md:grid-cols-2">
            {plans.map((plan) => {
              const pro = plan.name === "Pro";
              return (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-3xl p-8 ${pro ? "bg-slate-900 text-white shadow-2xl shadow-indigo-950/20" : "border border-slate-200 bg-white"}`}
                >
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="mt-4">
                    <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>{" "}
                    <span className={pro ? "text-slate-400" : "text-slate-500"}>{plan.period}</span>
                  </p>
                  <ul className={`mt-8 flex-1 space-y-3 ${pro ? "[&_svg]:fill-indigo-400" : ""}`}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <Check />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/sign-in"
                    className={`mt-10 rounded-full py-3 text-center font-medium transition ${pro ? "bg-indigo-500 text-white hover:bg-indigo-400" : "bg-slate-900 text-white hover:bg-slate-700"}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Prices in USD before applicable taxes. No credit card required for Free.
          </p>
        </section>

        <section id="faq" className="scroll-mt-8 px-4 py-24 sm:py-32">
          <SectionIntro eyebrow="FAQ" title="Questions, answered honestly." />
          <div className="mx-auto mt-12 max-w-2xl divide-y divide-slate-200">
            {faqs.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="text-xl text-slate-400 transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-slate-950 px-6 pt-20 pb-64 text-center text-white sm:pt-28 sm:pb-80">
            <LoopVideo
              src="/videos/stars.mp4"
              poster="/images/scene-stars.jpg"
              className="absolute inset-0 -z-10 size-full object-cover object-bottom"
            />
            <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-slate-950/40 to-transparent" />
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Take a breath. Your next resume is a few forms away.
            </h2>
            <p className="mt-4 text-white/80">Start free with 10 AI credits. No card needed.</p>
            <Link
              href="/auth/sign-in"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-medium text-slate-900 transition hover:-translate-y-0.5"
            >
              Create your resume <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-sm text-slate-500 sm:flex-row">
          <Logo className="text-slate-900" />
          <nav className="flex gap-6">
            <a href="#pricing" className="hover:text-slate-900">
              Pricing
            </a>
            <Link href="/privacy" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900">
              Terms
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-slate-900">
              Support
            </a>
          </nav>
          <p>© 2026 Veyro</p>
        </div>
      </footer>
    </>
  );
}
