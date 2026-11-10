import type { TraceEntry } from "@/lib/engine/types";
import type { LayoutEdge } from "./workflow-layout";

export type RunPath = {
  steps: Map<string, TraceEntry["status"]>;
  branches: Set<string>;
};

export function runPath(trace: TraceEntry[]): RunPath {
  const steps = new Map<string, TraceEntry["status"]>();
  const branches = new Set<string>();
  for (const entry of trace) {
    const previous = steps.get(entry.stepId);
    if (previous !== "failed") steps.set(entry.stepId, entry.status);
    if (entry.branch) branches.add(`${entry.stepId}:${entry.branch}`);
    if (entry.path.includes("["))
      branches.add(`${entry.path.split("[")[0]}:steps`);
  }
  return { steps, branches };
}

export function edgeTaken(edge: LayoutEdge, path: RunPath) {
  if (edge.branch) {
    const key = `${edge.branch.stepId}:${edge.branch.key}`;
    if (!path.branches.has(key)) return false;
    return edge.toStep ? path.steps.has(edge.toStep) : true;
  }
  return edge.toStep ? path.steps.has(edge.toStep) : false;
}
