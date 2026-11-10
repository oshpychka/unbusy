"use client";

import { useThemePreference } from "@/hooks/useThemePreference";
import type { ThemePreference } from "@/lib/theme";
import { IconButton } from "./Button";

const order: ThemePreference[] = ["system", "light", "dark"];
const labels: Record<ThemePreference, string> = {
  system: "Theme: system. Switch to light",
  light: "Theme: light. Switch to dark",
  dark: "Theme: dark. Switch to system",
};
const icons = { system: "monitor", light: "sun", dark: "moon" } as const;

export function ThemeToggle({ className }: { className?: string }) {
  const [preference, setPreference] = useThemePreference();
  const next =
    order[(order.indexOf(preference) + 1) % order.length] ?? "system";

  return (
    <IconButton
      icon={icons[preference]}
      label={labels[preference]}
      onClick={() => setPreference(next)}
      className={className}
    />
  );
}
