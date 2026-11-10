"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavLinkProps = {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

export function NavLink({ href, className, onClick, children }: NavLinkProps) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className={cn(
        "link-underline py-2",
        current ? "text-text" : "text-muted hover:text-text",
        className,
      )}
    >
      {children}
    </Link>
  );
}
