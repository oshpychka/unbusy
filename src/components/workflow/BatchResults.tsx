"use client";

import Link from "next/link";
import { SankeyChart } from "@/components/charts/SankeyChart";
import { RunStatus } from "@/components/app/RunStatus";
import { Button } from "@/components/ui/Button";
import { batchSummary, flowGraph } from "@/lib/engine/batch";
import type { DataRecord, Run, Workflow } from "@/lib/engine/types";
import { formatDuration } from "@/lib/format";
import { maskRecord } from "@/lib/mask";

function describeRecord(payload: DataRecord) {
  const masked = maskRecord(payload);
  return Object.values(masked)
    .filter((value) => typeof value === "string" || typeof value === "number")
    .slice(0, 2)
    .join(", ");
}

function decisions(run: Run) {
  return run.trace
    .filter(
      (entry) =>
        entry.output && ("result" in entry.output || "matched" in entry.output),
    )
    .map((entry) =>
      "result" in entry.output!
        ? entry.output!.result
          ? "Yes"
          : "No"
        : String(entry.output!.matched),
    )
    .join(", ");
}

type BatchResultsProps = {
  workflow: Workflow;
  runs: Run[];
  onRetry: () => void;
  onKeep: () => void;
};

export function BatchResults({
  workflow,
  runs,
  onRetry,
  onKeep,
}: BatchResultsProps) {
  const summary = batchSummary(runs);
  const graph = flowGraph(workflow, runs);

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Completed", summary.success],
          ["Stopped by a filter", summary.filtered],
          ["Failed", summary.failed],
          ["Waiting on rate limits", formatDuration(summary.throttledMs)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-line p-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="font-display text-2xl font-bold tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <SankeyChart
        nodes={graph.nodes}
        links={graph.links}
        total={summary.total}
      />

      <div className="flex flex-wrap gap-2">
        <Button icon="redo" disabled={summary.failed === 0} onClick={onRetry}>
          Retry {summary.failed} failed{" "}
          {summary.failed === 1 ? "record" : "records"}
        </Button>
        <Button variant="secondary" onClick={onKeep}>
          Save these runs to history
        </Button>
      </div>

      <div
        className="overflow-x-auto rounded-md border border-line"
        tabIndex={0}
        role="region"
        aria-label="Results for each record, scrollable"
      >
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Result for each record</caption>
          <thead className="bg-sunken text-left text-xs text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                #
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Record
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Decisions
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Throttled
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {runs.map((run, index) => {
              const throttled = run.trace.reduce(
                (sum, entry) => sum + entry.throttledMs,
                0,
              );
              return (
                <tr key={run.id}>
                  <td className="px-3 py-2 text-muted tabular-nums">
                    {index + 1}
                  </td>
                  <td className="max-w-56 truncate px-3 py-2">
                    {describeRecord(run.payload)}
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {decisions(run) || "None"}
                  </td>
                  <td className="px-3 py-2 text-muted tabular-nums">
                    {throttled ? formatDuration(throttled) : "No"}
                  </td>
                  <td className="px-3 py-2">
                    <RunStatus status={run.status} />
                    {run.error && (
                      <span className="mt-1 block text-xs text-danger">
                        {run.error}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Saved runs appear in{" "}
        <Link href="/app/runs" className="text-primary underline">
          run history
        </Link>
        , where each one opens in the step-by-step debugger.
      </p>
    </div>
  );
}
