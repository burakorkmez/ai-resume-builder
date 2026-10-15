import Link from "next/link";

// Vector redraw of the Higgsfield-generated mark (design/logo-generated.png); keep in sync with app/icon.svg.
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`text-indigo-600 ${className}`} aria-hidden>
      <path
        d="M6 11.2 14.2 25.6 22 12.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 2.4Q26.45 5.55 29.7 6.1 26.45 6.65 26 9.8 25.55 6.65 22.3 6.1 25.55 5.55 26 2.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({ className = "", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-1.5 text-lg font-semibold tracking-tight ${className}`}>
      <LogoMark />
      Veyro
    </Link>
  );
}
