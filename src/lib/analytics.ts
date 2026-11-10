import type { Run, Workflow } from "@/lib/engine/types";

const dayMs = 86_400_000;

export type Summary = {
  runs: number;
  succeeded: number;
  failed: number;
  failureRate: number;
  hoursSaved: number;
  recovered: number;
  dollarsSaved: number;
};

export function runsSince(runs: Run[], since: number) {
  return runs.filter((run) => run.startedAt >= since);
}

export function summarize(
  runs: Run[],
  workflows: Workflow[],
  hourlyRate: number,
): Summary {
  const minutes = new Map(
    workflows.map((workflow) => [workflow.id, workflow.settings.manualMinutes]),
  );
  let succeeded = 0;
  let failed = 0;
  let savedMinutes = 0;
  let recovered = 0;

  for (const run of runs) {
    recovered += run.recovered;
    if (run.status === "failed") {
      failed++;
      continue;
    }
    succeeded++;
    if (run.status === "success")
      savedMinutes += minutes.get(run.workflowId) ?? 0;
  }

  const hoursSaved = savedMinutes / 60;
  return {
    runs: runs.length,
    succeeded,
    failed,
    failureRate: runs.length ? failed / runs.length : 0,
    hoursSaved,
    recovered,
    dollarsSaved: hoursSaved * hourlyRate + recovered,
  };
}

export type DayPoint = { day: number; runs: number; failed: number };

export function runsByDay(runs: Run[], days: number, now: number): DayPoint[] {
  const today = Math.floor(now / dayMs) * dayMs;
  const points = Array.from({ length: days }, (_, index) => ({
    day: today - (days - 1 - index) * dayMs,
    runs: 0,
    failed: 0,
  }));
  for (const run of runs) {
    const index = Math.floor((run.startedAt - points[0]!.day) / dayMs);
    const point = points[index];
    if (!point) continue;
    point.runs++;
    if (run.status === "failed") point.failed++;
  }
  return points;
}

export type WorkflowStat = {
  workflow: Workflow;
  runs: number;
  failed: number;
  hoursSaved: number;
};

export function statsByWorkflow(
  runs: Run[],
  workflows: Workflow[],
): WorkflowStat[] {
  return workflows
    .map((workflow) => {
      const own = runs.filter((run) => run.workflowId === workflow.id);
      const success = own.filter((run) => run.status === "success").length;
      return {
        workflow,
        runs: own.length,
        failed: own.filter((run) => run.status === "failed").length,
        hoursSaved: (success * workflow.settings.manualMinutes) / 60,
      };
    })
    .sort((a, b) => b.hoursSaved - a.hoursSaved);
}

export function heatmap(runs: Run[]) {
  const grid = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0),
  );
  for (const run of runs) {
    const date = new Date(run.startedAt);
    const weekday = (date.getDay() + 6) % 7;
    grid[weekday]![date.getHours()]!++;
  }
  return grid;
}
