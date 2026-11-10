"use client";

import Link from "next/link";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { CanvasViewport } from "@/components/workflow/CanvasViewport";
import { TraceList } from "@/components/workflow/TraceList";
import {
  diagramSize,
  WorkflowDiagram,
} from "@/components/workflow/WorkflowDiagram";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/format";
import { runPath } from "@/lib/run-path";
import { useWorkspace } from "@/lib/store/workspace";
import { PageHeader } from "./PageHeader";
import { RunStatus } from "./RunStatus";

export function RunDetail({ id }: { id: string }) {
  const ready = useWorkspaceReady();
  const run = useWorkspace((state) =>
    state.runs.find((item) => item.id === id),
  );
  const workflow = useWorkspace((state) =>
    state.workflows.find((item) => item.id === run?.workflowId),
  );
  const canvas = useMediaQuery("(min-width: 768px)", true);

  if (!ready) return <Skeleton className="h-[60dvh] w-full" />;
  if (!run) {
    return (
      <EmptyState
        icon="runs"
        title="This run is no longer available"
        text="Run history keeps the latest 600 runs, and resetting the demo clears it."
        action={
          <Link href="/app/runs" className="text-primary underline">
            Back to runs
          </Link>
        }
      />
    );
  }

  const size = workflow ? diagramSize(workflow.steps) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={workflow?.name ?? "Deleted workflow"}
        description={`Run ${run.id}`}
        actions={
          workflow && (
            <Link
              href={`/app/workflows/${workflow.id}`}
              className="inline-flex min-h-11 items-center text-sm text-primary"
            >
              Open workflow
            </Link>
          )
        }
      />
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted">Status</dt>
          <dd className="mt-1">
            <RunStatus status={run.status} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Started</dt>
          <dd className="mt-1">{formatDateTime(run.startedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Workflow time</dt>
          <dd className="mt-1">
            {formatDuration(run.finishedAt - run.startedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Money recovered</dt>
          <dd className="mt-1">{formatCurrency(run.recovered)}</dd>
        </div>
      </dl>
      {run.error && (
        <p className="rounded-md border border-danger/40 bg-surface px-4 py-3 text-sm text-danger">
          {run.error}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {workflow && size && canvas && (
          <div className="h-[560px] overflow-hidden rounded-md border border-line">
            <CanvasViewport
              contentWidth={size.width}
              contentHeight={size.height}
              fitKey={run.id}
            >
              <WorkflowDiagram
                trigger={workflow.trigger}
                steps={workflow.steps}
                path={runPath(run.trace)}
              />
            </CanvasViewport>
          </div>
        )}
        <section aria-labelledby="trace-title" className="flex flex-col gap-3">
          <h2 id="trace-title" className="text-lg font-semibold">
            Steps
          </h2>
          <TraceList workflow={workflow} run={run} />
          <details className="rounded-md border border-line bg-surface">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-medium">
              Trigger data
            </summary>
            <pre className="overflow-x-auto border-t border-line bg-sunken px-3 py-2 font-mono text-xs">
              {JSON.stringify(run.payload, null, 2)}
            </pre>
          </details>
        </section>
      </div>
    </div>
  );
}
