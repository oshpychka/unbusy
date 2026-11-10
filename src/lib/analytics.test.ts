import { describe, expect, it } from "vitest";
import type { Run, Workflow } from "@/lib/engine/types";
import { heatmap, runsByDay, statsByWorkflow, summarize } from "./analytics";

const workflow = { id: "wf", settings: { manualMinutes: 30 } } as Workflow;
const now = Date.UTC(2026, 10, 10, 12);

function run(status: Run["status"], startedAt = now, recovered = 0): Run {
  return {
    id: "r",
    workflowId: "wf",
    status,
    startedAt,
    finishedAt: startedAt,
    payload: {},
    trace: [],
    recovered,
  };
}

describe("summarize", () => {
  it("counts hours only for successful runs and adds recovered money", () => {
    const summary = summarize(
      [
        run("success"),
        run("success", now, 500),
        run("failed"),
        run("filtered"),
      ],
      [workflow],
      40,
    );
    expect(summary.hoursSaved).toBe(1);
    expect(summary.recovered).toBe(500);
    expect(summary.dollarsSaved).toBe(540);
    expect(summary.failureRate).toBe(0.25);
  });

  it("handles no runs", () => {
    expect(summarize([], [workflow], 40).failureRate).toBe(0);
  });
});

describe("runsByDay", () => {
  it("buckets runs into days ending today", () => {
    const points = runsByDay(
      [run("success"), run("failed", now - 86_400_000)],
      7,
      now,
    );
    expect(points).toHaveLength(7);
    expect(points[6]?.runs).toBe(1);
    expect(points[5]?.failed).toBe(1);
  });
});

describe("statsByWorkflow and heatmap", () => {
  it("aggregates per workflow and per hour", () => {
    expect(
      statsByWorkflow([run("success"), run("success")], [workflow])[0]
        ?.hoursSaved,
    ).toBe(1);
    const grid = heatmap([run("success")]);
    expect(grid.flat().reduce((a, b) => a + b, 0)).toBe(1);
  });
});
