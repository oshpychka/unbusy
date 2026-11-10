"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { stepTitle } from "@/lib/engine/describe";
import { findStep } from "@/lib/engine/edit";
import type { Run, TraceEntry, Workflow } from "@/lib/engine/types";
import { formatDuration } from "@/lib/format";

export function entryNote(entry: TraceEntry) {
  if (entry.status === "failed")
    return entry.attempts > 1
      ? `failed after ${entry.attempts} tries`
      : "failed";
  if (entry.status === "stopped") return "stopped here";
  if (entry.waitedMs) return `waited ${formatDuration(entry.waitedMs)}`;
  if (entry.output && "result" in entry.output)
    return entry.output.result ? "Yes" : "No";
  if (entry.output && "matched" in entry.output)
    return String(entry.output.matched);
  if (
    entry.output &&
    "count" in entry.output &&
    typeof entry.output.count === "number"
  )
    return `${entry.output.count} items`;
  if (entry.attempts > 1) return `ok after ${entry.attempts} tries`;
  return "ok";
}

type TraceListProps = { workflow?: Workflow; run: Run; className?: string };

export function TraceList({ workflow, run, className }: TraceListProps) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ol
      className={cn(
        "flex flex-col divide-y divide-line rounded-md border border-line bg-surface",
        className,
      )}
    >
      {run.trace.map((entry, index) => {
        const step = workflow ? findStep(workflow.steps, entry.stepId) : null;
        const key = `${entry.path}-${index}`;
        const loopIndex = entry.path.match(/\[(\d+)\]/)?.[1];
        return (
          <li key={key}>
            <button
              type="button"
              aria-expanded={open === key}
              onClick={() => setOpen(open === key ? null : key)}
              className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-sunken"
            >
              <span className="min-w-0 truncate">
                {step ? stepTitle(step) : entry.stepId}
                {loopIndex !== undefined && (
                  <span className="text-muted">
                    {" "}
                    · item {Number(loopIndex) + 1}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "shrink-0",
                  entry.status === "failed"
                    ? "text-danger"
                    : entry.status === "stopped"
                      ? "text-warning"
                      : "text-muted",
                )}
              >
                {entryNote(entry)}
              </span>
            </button>
            {open === key && (
              <pre className="overflow-x-auto bg-sunken px-3 py-2 font-mono text-xs leading-relaxed">
                {JSON.stringify(
                  {
                    input: entry.input,
                    output: entry.output,
                    error: entry.error,
                  },
                  null,
                  2,
                )}
              </pre>
            )}
          </li>
        );
      })}
    </ol>
  );
}
