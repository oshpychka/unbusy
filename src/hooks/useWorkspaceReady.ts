"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useWorkspace } from "@/lib/store/workspace";

function subscribe(callback: () => void) {
  return useWorkspace.persist.onFinishHydration(callback);
}

export function useWorkspaceReady() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => useWorkspace.persist.hasHydrated(),
    () => false,
  );
  const seeded = useWorkspace((state) => state.seeded);
  const seed = useWorkspace((state) => state.seed);

  useEffect(() => {
    if (hydrated && !seeded) seed();
  }, [hydrated, seeded, seed]);

  return hydrated && seeded;
}
