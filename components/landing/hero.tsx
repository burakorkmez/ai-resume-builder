import Link from "next/link";
import { preload } from "react-dom";
import { Logo } from "./logo";
import { LoopVideo } from "./loop-video";

const nav = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const headline = ["Your", "story,", "clearly", "told."];

export function Hero() {
  preload("/images/hero.jpg", { as: "image", fetchPriority: "high" });

  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden bg-slate-900 text-white">
      <LoopVideo
        src="/videos/hero.mp4"
        poster="/images/hero.jpg"
        className="absolute inset-0 size-full object-cover object-[74%_center] md:object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-slate-950/45 via-slate-950/5 to-slate-950/25"
      />

      <header className="relative z-10 px-4 pt-5 motion-safe:animate-drop">
        <nav className="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-full bg-white py-2 pr-2 pl-5 text-slate-900 shadow-lg shadow-slate-950/10">
          <Logo />
          <ul className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="transition hover:text-slate-900">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/auth/sign-in"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center px-4 pt-[9vh] pb-24 md:pt-[14vh] text-center [text-shadow:0_2px_30px_rgb(15_23_42/0.35)]">
        <p
          className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-md [text-shadow:none] motion-safe:animate-rise"
          style={{ animationDelay: "150ms" }}
        >
          10 free AI credits · no card needed
        </p>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          {headline.map((word, i) => (
            <span key={word}>
              {i > 0 && " "}
              <span
                className="inline-block motion-safe:animate-rise"
                style={{ animationDelay: `${300 + i * 110}ms` }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p
          className="mt-6 max-w-xl text-lg text-white/85 motion-safe:animate-rise sm:text-xl"
          style={{ animationDelay: "800ms" }}
        >
          Turn your real experience into a polished resume, tailor it to any job, and download a
          clean PDF. AI suggests. You decide.
        </p>

        <div
          className="mt-9 flex flex-wrap items-center justify-center gap-3 motion-safe:animate-rise"
          style={{ animationDelay: "1000ms" }}
        >
          <Link
            href="/auth/sign-in"
            className="rounded-full bg-white px-6 py-3 font-medium text-slate-900 [text-shadow:none] shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Create your resume <span aria-hidden>→</span>
          </Link>
          <a
            href="#sample"
            className="rounded-full px-6 py-3 font-medium text-white transition hover:bg-white/10"
          >
            See a sample
          </a>
        </div>
      </div>

    </section>
  );
}
