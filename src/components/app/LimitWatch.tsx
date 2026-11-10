import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Run, Workflow } from "@/lib/engine/types";

const stateText = {
  green: "On track",
  yellow: "Warning",
  red: "Over the alert level",
} as const;

export function LimitWatch({
  workflows,
  runs,
}: {
  workflows: Workflow[];
  runs: Run[];
}) {
  const monitors = workflows.filter(
    (workflow) => workflow.trigger.app === "monitor",
  );
  const latest = monitors
    .map((workflow) => ({
      workflow,
      run: runs.find((run) => run.workflowId === workflow.id),
    }))
    .filter((item): item is { workflow: Workflow; run: Run } =>
      Boolean(item.run),
    );

  if (latest.length === 0) return null;

  return (
    <section
      aria-labelledby="limits-title"
      className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4"
    >
      <h2 id="limits-title" className="text-sm font-semibold">
        Limits being watched
      </h2>
      {latest.map(({ workflow, run }) => {
        const used = Number(run.payload.used) || 0;
        const limit = Number(run.payload.limit) || 1;
        const forecast = Number(run.payload.forecast) || 0;
        const state = (run.payload.state as keyof typeof stateText) ?? "green";
        return (
          <div key={workflow.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <Link
                href={`/app/workflows/${workflow.id}`}
                className="font-medium hover:text-primary"
              >
                {String(run.payload.client)},{" "}
                {String(run.payload.metric).toLowerCase()}
              </Link>
              <span
                className={cn(
                  "text-xs",
                  state === "red"
                    ? "text-danger"
                    : state === "yellow"
                      ? "text-warning"
                      : "text-success",
                )}
              >
                {stateText[state]}
              </span>
            </div>
            <div
              className="relative h-2.5 rounded-full bg-sunken"
              role="img"
              aria-label={`${used} of ${limit} used, forecast ${forecast}`}
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-chart"
                style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
              />
              <span
                className="absolute -inset-y-1 w-0.5 bg-text"
                style={{ left: `${Math.min(100, (forecast / limit) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted">
              {used} of {limit} used. At this pace the period ends near{" "}
              {forecast}.
            </p>
          </div>
        );
      })}
    </section>
  );
}
