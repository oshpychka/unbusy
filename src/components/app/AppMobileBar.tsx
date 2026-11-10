"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/cn";
import { appNav, isActive, settingsNav } from "./app-nav";

export function AppTopBar() {
  const pathname = usePathname();
  const settingsActive = isActive(pathname, settingsNav.href);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-2 pl-4 md:hidden">
      <Logo href="/" className="text-lg" />
      <div className="flex items-center">
        <ThemeToggle />
        <Link
          href={settingsNav.href}
          aria-label="Settings"
          aria-current={settingsActive ? "page" : undefined}
          className={cn(
            "grid size-11 place-items-center rounded-md hover:bg-sunken",
            settingsActive && "text-primary",
          )}
        >
          <Icon name="settings" />
        </Link>
      </div>
    </header>
  );
}

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {appNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
