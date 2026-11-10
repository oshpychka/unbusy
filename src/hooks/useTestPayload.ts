"use client";

import { useMemo, useState } from "react";
import { samplePayload } from "@/lib/engine/samples";
import type { DataRecord, Trigger } from "@/lib/engine/types";

export function parsePayload(text: string): DataRecord | null {
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : null;
  } catch {
    return null;
  }
}

export function useTestPayload(trigger: Trigger | undefined) {
  const [seed, setSeed] = useState(1);
  const [edited, setEdited] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());

  const sample = useMemo(
    () =>
      trigger
        ? JSON.stringify(samplePayload(trigger, seed, openedAt), null, 2)
        : "{}",
    [trigger, seed, openedAt],
  );
  const text = edited ?? sample;

  return {
    text,
    payload: parsePayload(text),
    setText: setEdited,
    newSample: () => {
      setEdited(null);
      setSeed((value) => value + 1);
    },
  };
}
