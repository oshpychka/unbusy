"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useModifierLabel() {
  return useSyncExternalStore(
    subscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "Ctrl",
  );
}
