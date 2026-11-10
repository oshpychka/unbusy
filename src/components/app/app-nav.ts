import type { IconName } from "@/components/ui/Icon";

export type AppNavItem = { href: string; label: string; icon: IconName };

export const appNav: AppNavItem[] = [
  { href: "/app", label: "Overview", icon: "overview" },
  { href: "/app/workflows", label: "Workflows", icon: "workflow" },
  { href: "/app/runs", label: "Runs", icon: "runs" },
  { href: "/app/analytics", label: "Analytics", icon: "chart" },
  { href: "/app/playbooks", label: "Playbooks", icon: "book" },
];

export const settingsNav: AppNavItem = {
  href: "/app/settings",
  label: "Settings",
  icon: "settings",
};

export function isActive(pathname: string, href: string) {
  return href === "/app"
    ? pathname === "/app"
    : pathname === href || pathname.startsWith(`${href}/`);
}
