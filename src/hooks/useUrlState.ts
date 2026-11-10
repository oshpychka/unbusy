"use client";

import { useCallback, useSyncExternalStore } from "react";

const urlEvent = "unbusy-url";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(urlEvent, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(urlEvent, callback);
  };
}

export function useUrlState<T extends string>(
  key: string,
  fallback: T,
  allowed?: readonly T[],
) {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const raw = new URLSearchParams(search).get(key);
  const value =
    raw !== null && (!allowed || allowed.includes(raw as T))
      ? (raw as T)
      : fallback;

  const setValue = useCallback(
    (next: T) => {
      const params = new URLSearchParams(window.location.search);
      if (next === fallback) params.delete(key);
      else params.set(key, next);
      const query = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        query ? `?${query}` : window.location.pathname,
      );
      window.dispatchEvent(new Event(urlEvent));
    },
    [fallback, key],
  );

  return [value, setValue] as const;
}
