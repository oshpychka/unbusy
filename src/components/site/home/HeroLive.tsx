"use client";

import { useEffect, useMemo, useState } from "react";
import { FitToWidth } from "@/components/workflow/FitToWidth";
import {
  diagramSize,
  WorkflowDiagram,
} from "@/components/workflow/WorkflowDiagram";
import { heroPayload, heroWorkflow } from "@/data/hero";
import { useRunPlayback } from "@/hooks/useRunPlayback";
import { stepTitle } from "@/lib/engine/describe";
import { findStep } from "@/lib/engine/edit";
import { execute } from "@/lib/engine/executor";
import type { Run, TraceEntry } from "@/lib/engine/types";

const size = diagramSize(heroWorkflow.steps);
const start = Date.UTC(2026, 10, 10, 9, 0);

function logLine(entry: TraceEntry) {
  const step = findStep(heroWorkflow.steps, entry.stepId);
  const title = step ? stepTitle(step) : entry.stepId;
  if (entry.output && "result" in entry.output)
    return `${title} ${entry.output.result ? "Yes" : "No"}`;
  return `${title}: done`;
}

function clock(time: number) {
  return new Date(time).toISOString().slice(11, 19);
}

export function HeroLive() {
  const [days, setDays] = useState(34);
  const [run, setRun] = useState<Run | null>(null);
  const playback = useRunPlayback(run);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRun(
        execute(heroWorkflow, heroPayload(days), {
          seed: days,
          startedAt: start,
          runId: `hero_${days}`,
          failureRate: 0,
        }),
      );
    }, 180);
    return () => window.clearTimeout(timer);
  }, [days]);

  const lines = useMemo(() => {
    if (!run) return [];
    const visible = playback.done
      ? run.trace
      : run.trace.slice(
          0,
          Math.max(
            0,
            run.trace.findIndex(
              (entry) => entry.stepId === playback.activeStep,
            ),
          ),
        );
    return [
      { time: start, text: `INV-1042, $1,850, ${days} days late` },
      ...visible.map((entry) => ({
        time: entry.finishedAt,
        text: logLine(entry),
      })),
    ].slice(-3);
  }, [run, playback.done, playback.activeStep, days]);

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="hero-days" className="text-sm font-medium">
          Days overdue: <span className="font-mono tabular-nums">{days}</span>
        </label>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span aria-hidden className="size-2 rounded-full bg-signal" />
          Running in your browser
        </span>
      </div>
      <input
        id="hero-days"
        type="range"
        className="range"
        min={1}
        max={60}
        value={days}
        onChange={(event) => setDays(Number(event.target.value))}
        aria-describedby="hero-log"
      />
      <div className="dot-grid rounded-md border border-line p-2">
        <FitToWidth width={size.width} height={size.height}>
          <WorkflowDiagram
            trigger={heroWorkflow.trigger}
            steps={heroWorkflow.steps}
            path={playback.path}
            activeStep={playback.activeStep}
            token
          />
        </FitToWidth>
      </div>
      <ol
        id="hero-log"
        aria-live="polite"
        className="flex min-h-[4.5rem] flex-col gap-0.5 rounded-md bg-sunken px-3 py-2 font-mono text-xs"
      >
        {lines.map((line, index) => (
          <li key={`${line.text}-${index}`} className="flex gap-3">
            <span className="text-muted">{clock(line.time)}</span>
            <span className="truncate">{line.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
