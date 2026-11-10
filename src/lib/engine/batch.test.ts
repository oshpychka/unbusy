import { describe, expect, it } from "vitest";
import { getPlaybook } from "@/data/playbooks";
import { workflowFromPlaybook } from "@/lib/workflow-factory";
import {
  batchSize,
  batchSummary,
  flowGraph,
  retryFailed,
  runBatch,
} from "./batch";
import { samplePayloads } from "./samples";

const start = Date.UTC(2026, 10, 10, 9);
const workflow = workflowFromPlaybook(
  getPlaybook("support-escalation")!,
  "wf",
  "",
);
const runs = runBatch(
  workflow,
  samplePayloads(workflow.trigger, batchSize, 3, start),
  3,
  start,
);

describe("runBatch", () => {
  it("runs every record and splits them across branches", () => {
    const summary = batchSummary(runs);
    expect(summary.total).toBe(batchSize);
    expect(summary.success + summary.filtered + summary.failed).toBe(batchSize);
    const priorities = new Set(
      runs.map((run) => run.trace[0]?.output?.matched),
    );
    expect(priorities.size).toBeGreaterThan(1);
  });

  it("throttles when many runs hit the same app at once", () => {
    expect(batchSummary(runs).throttledMs).toBeGreaterThan(0);
  });

  it("retries only failed runs", () => {
    const retried = retryFailed(workflow, runs, 99, start);
    runs.forEach((run, index) => {
      if (run.status !== "failed") expect(retried[index]).toBe(run);
    });
  });
});

describe("flowGraph", () => {
  it("builds an acyclic graph whose totals match the runs", () => {
    const graph = flowGraph(workflow, runs);
    const fromTrigger = graph.links
      .filter((link) => link.source === "trigger")
      .reduce((sum, link) => sum + link.value, 0);
    const intoEnds = graph.links
      .filter((link) => link.target.startsWith("end:"))
      .reduce((sum, link) => sum + link.value, 0);
    expect(fromTrigger).toBe(batchSize);
    expect(intoEnds).toBe(batchSize);
    expect(graph.links.every((link) => link.source !== link.target)).toBe(true);
  });

  it("does not repeat loop steps", () => {
    const onboarding = workflowFromPlaybook(
      getPlaybook("client-onboarding")!,
      "wf2",
      "",
    );
    const loopRuns = runBatch(
      onboarding,
      samplePayloads(onboarding.trigger, 5, 1, start),
      1,
      start,
    );
    const graph = flowGraph(onboarding, loopRuns);
    expect(
      graph.links.find(
        (link) => link.source === "setup_task" && link.target === "setup_task",
      ),
    ).toBeUndefined();
  });
});
