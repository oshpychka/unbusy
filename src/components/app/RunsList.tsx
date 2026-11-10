"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Select } from "@/components/ui/Select";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { useUrlState } from "@/hooks/useUrlState";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { formatDateTime, formatDuration } from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace";
import { PageHeader } from "./PageHeader";
import { RunStatus } from "./RunStatus";

const statuses = ["all", "success", "failed", "filtered"] as const;
const ranges = ["30", "7", "1"] as const;
const pageSize = 40;

export function RunsList() {
  const ready = useWorkspaceReady();
  const { runs, workflows } = useWorkspace();
  const [status, setStatus] = useUrlState("status", "all", statuses);
  const [range, setRange] = useUrlState("days", "30", ranges);
  const [workflowId, setWorkflowId] = useUrlState<string>("workflow", "all");
  const [limit, setLimit] = useState(pageSize);
  const [since] = useState(() => Date.now());

  const names = new Map(
    workflows.map((workflow) => [workflow.id, workflow.name]),
  );
  const from = since - Number(range) * 86_400_000;
  const filtered = runs.filter(
    (run) =>
      run.startedAt >= from &&
      (status === "all" || run.status === status) &&
      (workflowId === "all" || run.workflowId === workflowId),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Runs"
        description="Every run, newest first. Open one to see what happened at each step."
      />
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All" },
            { value: "success", label: "Succeeded" },
            { value: "failed", label: "Failed" },
            { value: "filtered", label: "Stopped" },
          ]}
        />
        <Select
          label="Workflow"
          className="w-full sm:w-64"
          value={workflowId}
          onChange={setWorkflowId}
          options={[
            { value: "all", label: "All workflows" },
            ...workflows.map((workflow) => ({
              value: workflow.id,
              label: workflow.name,
            })),
          ]}
        />
        <Select
          label="Period"
          className="w-full sm:w-44"
          value={range}
          onChange={setRange}
          options={[
            { value: "30", label: "Last 30 days" },
            { value: "7", label: "Last 7 days" },
            { value: "1", label: "Last 24 hours" },
          ]}
        />
      </div>

      <p className="text-sm text-muted" aria-live="polite">
        {ready ? `${filtered.length} runs` : "Loading runs"}
      </p>

      {!ready ? (
        <Skeleton className="h-96 w-full" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="runs"
          title="No runs match these filters"
          text="Try another status, workflow or period."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="hidden border-b border-line bg-sunken text-left text-xs text-muted md:table-header-group">
                <tr>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Workflow
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Started
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Duration
                  </th>
                  <th scope="col" className="px-4 py-2 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.slice(0, limit).map((run) => (
                  <tr
                    key={run.id}
                    className="relative grid grid-cols-[1fr_auto] gap-x-3 px-4 py-3 hover:bg-sunken/60 md:table-row md:p-0"
                  >
                    <td className="min-w-0 md:px-4 md:py-3">
                      <Link
                        href={`/app/runs/${run.id}`}
                        className="block truncate font-medium after:absolute after:inset-0"
                      >
                        {names.get(run.workflowId) ?? "Deleted workflow"}
                      </Link>
                      {run.error && (
                        <span className="block truncate text-xs text-danger">
                          {run.error}
                        </span>
                      )}
                    </td>
                    <td className="col-start-1 text-muted md:px-4 md:py-3">
                      {formatDateTime(run.startedAt)}
                    </td>
                    <td className="hidden text-muted md:table-cell md:px-4 md:py-3">
                      {formatDuration(run.finishedAt - run.startedAt)}
                    </td>
                    <td className="col-start-2 row-span-2 row-start-1 self-center md:px-4 md:py-3">
                      <RunStatus status={run.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > limit && (
            <Button
              variant="secondary"
              className="self-center"
              onClick={() => setLimit(limit + pageSize)}
            >
              Show more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
