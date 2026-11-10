"use client";

import { useEffect, useState } from "react";
import type { Run } from "@/lib/engine/types";
import { runPath } from "@/lib/run-path";
import { useMediaQuery } from "./useMediaQuery";

const stepMs = 420;

export function useRunPlayback(run: Run | null) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [progress, setProgress] = useState<{
    runId: string | null;
    index: number;
  }>({ runId: null, index: 0 });
  const total = run?.trace.length ?? 0;
  const index = run && progress.runId === run.id ? progress.index : 0;
  const done = !run || reduced || index >= total;

  useEffect(() => {
    if (!run || reduced) return;
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = current.runId === run.id ? current.index + 1 : 1;
        if (next >= run.trace.length) window.clearInterval(timer);
        return { runId: run.id, index: Math.min(next, run.trace.length) };
      });
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [run, reduced]);

  const visible = run ? (done ? run.trace : run.trace.slice(0, index)) : [];
  return {
    path: run ? runPath(visible) : undefined,
    activeStep: done ? null : (run?.trace[index]?.stepId ?? null),
    done,
  };
}
