"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/logo";
import { credits, Sparkle } from "@/components/ui";
import { usage, useAppState } from "@/lib/store";

const links = [
  { href: "/dashboard", label: "Resumes" },
  { href: "/billing", label: "Billing" },
  { href: "/account", label: "Account" },
];

export function AppNav() {
  const pathname = usePathname();
  const state = useAppState();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-6">
        <Logo href="/dashboard" />
        <nav className="ml-auto flex gap-1 text-sm sm:ml-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className="rounded-full px-3 py-1.5 text-slate-600 transition hover:text-slate-900 aria-[current=page]:bg-slate-100 aria-[current=page]:font-medium aria-[current=page]:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {state && (
          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <Link
              href="/billing"
              className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              <Sparkle /> {credits(usage(state).credits)}
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="grid size-9 place-items-center rounded-full bg-slate-900 text-sm font-medium text-white"
            >
              {state.user.name.charAt(0)}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
