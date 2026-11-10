"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { appNav, isActive, settingsNav, type AppNavItem } from "./app-nav";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-4 md:flex">
      <Logo href="/" className="px-2" />
      <nav aria-label="App" className="mt-6 flex-1">
        <ul className="flex flex-col gap-0.5">
          {appNav.map((item) => (
            <li key={item.href}>
              <SidebarLink item={item} active={isActive(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex flex-col gap-3 border-t border-line pt-3">
        <SidebarLink
          item={settingsNav}
          active={isActive(pathname, settingsNav.href)}
        />
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted">Demo workspace</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: AppNavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-2 text-sm font-medium transition-colors",
        active
          ? "bg-sunken text-text"
          : "text-muted hover:bg-sunken hover:text-text",
      )}
    >
      <Icon name={item.icon} className={active ? "text-primary" : undefined} />
      {item.label}
    </Link>
  );
}
