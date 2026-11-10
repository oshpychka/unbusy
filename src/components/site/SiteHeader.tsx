import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SkipLink } from "@/components/ui/SkipLink";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";
import { siteNav } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-sm">
      <SkipLink />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {siteNav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href="/app" size="sm" className="ml-2 max-sm:hidden">
            Open the demo
          </ButtonLink>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
