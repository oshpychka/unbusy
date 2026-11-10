"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useUrlState<T extends string>(
  key: string,
  fallback: T,
  allowed?: readonly T[],
) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get(key);
  const value =
    raw !== null && (!allowed || allowed.includes(raw as T))
      ? (raw as T)
      : fallback;

  const setValue = useCallback(
    (next: T) => {
      const search = new URLSearchParams(window.location.search);
      if (next === fallback) search.delete(key);
      else search.set(key, next);
      const query = search.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [fallback, key, pathname, router],
  );

  return [value, setValue] as const;
}
