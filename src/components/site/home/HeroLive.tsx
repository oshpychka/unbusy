"use client";

import { useEffect, useState } from "react";
import { FitToWidth } from "@/components/workflow/FitToWidth";
import {
  diagramSize,
  WorkflowDiagram,
} from "@/components/workflow/WorkflowDiagram";
import { heroPayload, heroWorkflow } from "@/data/hero";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { stepTitle } from "@/lib/engine/describe";
import { findStep } from "@/lib/engine/edit";
import { execute } from "@/lib/engine/executor";
import type { Run, TraceEntry } from "@/lib/engine/types";
import { runPath } from "@/lib/run-path";

const size = diagramSize(heroWorkflow.steps);
const start = Date.UTC(2026, 10, 10, 9, 0);
const stepMs = 900;
const settleMs = 250;

type Playback = { run: Run; signature: string; index: number };

function runFor(days: number) {
  return execute(heroWorkflow, heroPayload(days), {
    seed: days,
    startedAt: start,
    runId: `hero_${days}`,
    failureRate: 0,
  });
}

function signatureOf(run: Run) {
  return run.trace.map((entry) => entry.stepId).join(">");
}

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
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [days, setDays] = useState(34);
  const [playback, setPlayback] = useState<Playback>(() => {
    const run = runFor(34);
    return { run, signature: signatureOf(run), index: 0 };
  });
  const { run, signature, index } = playback;
  const total = run.trace.length;
  const playing = !reduced && index < total;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = runFor(days);
      const nextSignature = signatureOf(next);
      setPlayback((current) =>
        current.signature === nextSignature
          ? { ...current, run: next }
          : { run: next, signature: nextSignature, index: 0 },
      );
    }, settleMs);
    return () => window.clearTimeout(timer);
  }, [days]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setPlayback((current) => ({ ...current, index: current.index + 1 }));
    }, stepMs);
    return () => window.clearTimeout(timer);
  }, [playing, index, signature]);

  const visible = playing ? run.trace.slice(0, index) : run.trace;
  const activeStep = playing ? (run.trace[index]?.stepId ?? null) : null;
  const path = runPath(visible);

  const lines = [
    { time: start, text: `INV-1042, $1,850, ${days} days late` },
    ...visible.map((entry) => ({
      time: entry.finishedAt,
      text: logLine(entry),
    })),
  ].slice(-3);

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
      <div className="dot-grid rounded-md border border-line p-2 [--token-ms:820ms]">
        <FitToWidth width={size.width} height={size.height}>
          <WorkflowDiagram
            trigger={heroWorkflow.trigger}
            steps={heroWorkflow.steps}
            path={path}
            activeStep={activeStep}
            token={`${signature}-${index}`}
          />
        </FitToWidth>
      </div>
      <ol
        id="hero-log"
        aria-live="polite"
        className="flex min-h-[4.5rem] flex-col gap-0.5 rounded-md bg-sunken px-3 py-2 font-mono text-xs"
      >
        {lines.map((line, position) => (
          <li key={`${line.text}-${position}`} className="flex gap-3">
            <span className="text-muted">{clock(line.time)}</span>
            <span className="truncate">{line.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
