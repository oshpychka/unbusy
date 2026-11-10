import { describe, expect, it } from "vitest";
import { seedWorkflows } from "@/data/workspace";
import { seedRuns } from "./seed-runs";

describe("seedRuns", () => {
  const now = Date.UTC(2026, 10, 10, 18);
  const runs = seedRuns(seedWorkflows(now), now);

  it("creates about a month of history", () => {
    expect(runs.length).toBeGreaterThan(250);
    expect(runs.length).toBeLessThan(450);
    expect(
      runs.every(
        (run) =>
          run.finishedAt <= now && run.startedAt >= now - 31 * 86_400_000,
      ),
    ).toBe(true);
  });

  it("includes some failures and recovered money", () => {
    const failed = runs.filter((run) => run.status === "failed");
    expect(failed.length).toBeGreaterThan(2);
    expect(failed.length).toBeLessThan(runs.length * 0.1);
    expect(runs.reduce((sum, run) => sum + run.recovered, 0)).toBeGreaterThan(
      0,
    );
  });

  it("is sorted newest first", () => {
    expect(
      runs.every(
        (run, index) =>
          index === 0 || runs[index - 1]!.startedAt >= run.startedAt,
      ),
    ).toBe(true);
  });
});
