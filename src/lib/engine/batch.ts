import { stepTitle } from "./describe";
import { findStep } from "./edit";
import { execute } from "./executor";
import { createRateLimiter } from "./ratelimit";
import type { DataRecord, Run, Workflow } from "./types";

export const batchSize = 50;
const batchFailureRate = 0.04;
export const arrivalSpacingMs = 4000;

export function runBatch(
  workflow: Workflow,
  payloads: DataRecord[],
  seed: number,
  startedAt: number,
): Run[] {
  const limiter = createRateLimiter();
  return payloads.map((payload, index) =>
    execute(workflow, payload, {
      seed: seed + index * 104729,
      startedAt: startedAt + index * arrivalSpacingMs,
      runId: `batch_${seed.toString(36)}_${index}`,
      failureRate: batchFailureRate,
      limiter,
    }),
  );
}

export function retryFailed(
  workflow: Workflow,
  runs: Run[],
  seed: number,
  startedAt: number,
): Run[] {
  const limiter = createRateLimiter();
  return runs.map((run, index) =>
    run.status !== "failed"
      ? run
      : execute(workflow, run.payload, {
          seed: seed + index * 7907,
          startedAt: startedAt + index * arrivalSpacingMs,
          runId: `${run.id}_r${seed.toString(36)}`,
          failureRate: batchFailureRate,
          limiter,
        }),
  );
}

export type FlowNode = {
  id: string;
  label: string;
  kind: "trigger" | "step" | "end";
};
export type FlowLink = { source: string; target: string; value: number };

const ends = {
  success: "Completed",
  filtered: "Stopped by a filter",
  failed: "Failed",
} as const;

export function flowGraph(workflow: Workflow, runs: Run[]) {
  const nodes = new Map<string, FlowNode>([
    ["trigger", { id: "trigger", label: "Trigger", kind: "trigger" }],
  ]);
  const links = new Map<string, FlowLink>();

  for (const run of runs) {
    const visited = new Set<string>(["trigger"]);
    let previous = "trigger";
    for (const entry of run.trace) {
      if (visited.has(entry.stepId)) continue;
      visited.add(entry.stepId);
      if (!nodes.has(entry.stepId)) {
        const step = findStep(workflow.steps, entry.stepId);
        nodes.set(entry.stepId, {
          id: entry.stepId,
          label: step ? stepTitle(step) : entry.stepId,
          kind: "step",
        });
      }
      const key = `${previous}>${entry.stepId}`;
      const link = links.get(key) ?? {
        source: previous,
        target: entry.stepId,
        value: 0,
      };
      link.value++;
      links.set(key, link);
      previous = entry.stepId;
    }
    const end = `end:${run.status}`;
    nodes.set(end, { id: end, label: ends[run.status], kind: "end" });
    const key = `${previous}>${end}`;
    const link = links.get(key) ?? { source: previous, target: end, value: 0 };
    link.value++;
    links.set(key, link);
  }

  return { nodes: [...nodes.values()], links: [...links.values()] };
}

export function batchSummary(runs: Run[]) {
  const throttledMs = runs.reduce(
    (sum, run) =>
      sum + run.trace.reduce((inner, entry) => inner + entry.throttledMs, 0),
    0,
  );
  return {
    total: runs.length,
    success: runs.filter((run) => run.status === "success").length,
    filtered: runs.filter((run) => run.status === "filtered").length,
    failed: runs.filter((run) => run.status === "failed").length,
    throttledMs,
  };
}
