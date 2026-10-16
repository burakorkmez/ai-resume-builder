import Image from "next/image";
import Link from "next/link";
import { GoogleSignIn } from "@/components/google-sign-in";
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

          <GoogleSignIn />

          <p className="mt-10 text-xs text-slate-500">
            We only use your Google name and email to identify your account.{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              How we handle your data
            </Link>
            . By continuing, you agree to the{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
