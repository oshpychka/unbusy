import { getApp } from "@/data/apps";
import { findStep } from "@/lib/engine/edit";
import type { TraceEntry, Workflow } from "@/lib/engine/types";
import { formatDuration } from "@/lib/format";

export function entryNotes(entry: TraceEntry, workflow?: Workflow) {
  const notes: {
    tone: "muted" | "warning" | "danger" | "signal";
    text: string;
  }[] = [];
  const step = workflow ? findStep(workflow.steps, entry.stepId) : null;
  if (entry.waitedMs)
    notes.push({
      tone: "signal",
      text: `Skipped ahead ${formatDuration(entry.waitedMs)}. In a live run this step would wait.`,
    });
  if (entry.throttledMs && step?.type === "action") {
    notes.push({
      tone: "warning",
      text: `Waited ${formatDuration(entry.throttledMs)} for the ${getApp(step.app).name} rate limit`,
    });
  }
  if (entry.attempts > 1) {
    notes.push({
      tone: entry.status === "failed" ? "danger" : "warning",
      text:
        entry.status === "failed"
          ? `Failed after ${entry.attempts} tries`
          : `Succeeded on try ${entry.attempts}`,
    });
  }
  if (entry.error) notes.push({ tone: "danger", text: entry.error });
  if (entry.status === "stopped")
    notes.push({
      tone: "muted",
      text: "Conditions did not match, so the run stopped here",
    });
  if (entry.branch === "fallback")
    notes.push({ tone: "warning", text: "Took the error path" });
  return notes;
}
