"use client";

import { useSyncExternalStore } from "react";
import {
  applyThemePreference,
  readThemePreference,
  subscribeToTheme,
  type ThemePreference,
} from "@/lib/theme";

export function useThemePreference() {
  const preference = useSyncExternalStore<ThemePreference>(
    subscribeToTheme,
    readThemePreference,
    () => "system",
  );
  return [preference, applyThemePreference] as const;
}
