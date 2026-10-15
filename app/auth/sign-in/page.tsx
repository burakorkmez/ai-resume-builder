import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import hill from "@/public/images/scene-hill.jpg";

export const metadata = { title: "Sign in" };

export default function SignIn() {
  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src={hill} alt="" placeholder="blur" priority sizes="50vw" className="absolute inset-0 size-full object-cover" />
        <p className="absolute bottom-10 left-10 max-w-sm text-2xl font-semibold tracking-tight text-white [text-shadow:0_2px_20px_rgb(15_23_42/0.5)]">
          Your story, clearly told.
        </p>
      </div>

      <div className="flex flex-col px-6 py-8">
        <Logo />
        <div className="m-auto w-full max-w-sm py-16">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to Veyro</h1>
          <p className="mt-2 text-slate-600">Sign in to create, tailor, and download your resumes. New here? This creates your free account.</p>

          {/* ponytail: demo sign-in. Replace with the Neon Auth Google flow (plan.md §7). */}
          <Link
            href="/dashboard"
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white px-4 py-3 font-medium text-slate-900 ring-1 ring-slate-300 transition hover:bg-slate-50"
          >
            <GoogleIcon />
            Continue with Google
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500">Demo mode: no real sign-in happens.</p>

          <p className="mt-10 text-xs text-slate-500">
            By continuing, you agree to the{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            . We only use your Google name and email to identify your account.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
