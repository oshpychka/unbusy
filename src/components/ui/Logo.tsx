import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden
      className={className}
    >
      <rect
        x="1.5"
        y="3"
        width="8"
        height="6"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="14.5"
        y="15"
        width="8"
        height="6"
        rx="1.5"
        fill="var(--primary)"
      />
      <path
        d="M5.5 9v4.5a2.5 2.5 0 0 0 2.5 2.5h6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="14.5" cy="6" r="2" fill="var(--signal)" />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 font-display text-xl font-bold tracking-tight",
        className,
      )}
    >
      <LogoMark />
      Unbusy
    </Link>
  );
}
