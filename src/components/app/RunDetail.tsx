"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { toast } from "@/components/ui/Toaster";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { execute } from "@/lib/engine/executor";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/format";
import { maskRecord } from "@/lib/mask";
import { useWorkspace } from "@/lib/store/workspace";
import { RunDebugger } from "./debugger/RunDebugger";
import { PageHeader } from "./PageHeader";
import { RunStatus } from "./RunStatus";

export function RunDetail({ id }: { id: string }) {
  const ready = useWorkspaceReady();
  const router = useRouter();
  const run = useWorkspace((state) =>
    state.runs.find((item) => item.id === id),
  );
  const workflow = useWorkspace((state) =>
    state.workflows.find((item) => item.id === run?.workflowId),
  );
  const addRuns = useWorkspace((state) => state.addRuns);

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

  function replay() {
    if (!workflow || !run) return;
    const seed = Math.floor(Math.random() * 2 ** 31);
    const next = execute(workflow, run.payload, {
      seed,
      startedAt: Date.now(),
      runId: `run_${seed.toString(36)}`,
    });
    addRuns([next]);
    toast(
      next.status === "failed" ? "Replay failed again" : "Replay finished",
      next.status === "failed" ? "danger" : "success",
    );
    router.push(`/app/runs/${next.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={workflow?.name ?? "Deleted workflow"}
        description={`Run ${run.id}`}
        actions={
          <>
            {workflow && (
              <Link
                href={`/app/workflows/${workflow.id}`}
                className="inline-flex min-h-11 items-center px-2 text-sm text-primary"
              >
                Open workflow
              </Link>
            )}
            {workflow && run.status === "failed" && (
              <Button icon="play" onClick={replay}>
                Replay with the same data
              </Button>
            )}
          </>
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

      <RunDebugger key={run.id} run={run} workflow={workflow} />

      <details className="rounded-md border border-line bg-surface">
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-sm font-medium">
          Trigger data
        </summary>
        <pre className="overflow-x-auto border-t border-line bg-sunken px-3 py-2 font-mono text-xs">
          {JSON.stringify(maskRecord(run.payload), null, 2)}
        </pre>
      </details>
    </div>
  );
}
