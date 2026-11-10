"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DailyRunsChart } from "@/components/charts/DailyRunsChart";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { runsByDay, runsSince, summarize } from "@/lib/analytics";
import {
  formatCurrency,
  formatDateTime,
  formatHours,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace";
import { LimitWatch } from "./LimitWatch";
import { PageHeader } from "./PageHeader";
import { RunStatus } from "./RunStatus";
import { StatTile } from "./StatTile";

const dayMs = 86_400_000;

export function Overview() {
  const ready = useWorkspaceReady();
  const { runs, workflows, settings } = useWorkspace();
  const [now] = useState(() => Date.now());

  const data = useMemo(() => {
    const month = runsSince(runs, now - 30 * dayMs);
    const week = runsSince(runs, now - 7 * dayMs);
    const failing = workflows
      .map((workflow) => ({
        workflow,
        failed: week.filter(
          (run) => run.workflowId === workflow.id && run.status === "failed",
        ).length,
      }))
      .filter((item) => item.failed > 0);
    return {
      summary: summarize(month, workflows, settings.hourlyRate),
      points: runsByDay(runs, 14, now),
      failing,
      off: workflows.filter((workflow) => !workflow.enabled),
    };
  }, [runs, workflows, settings.hourlyRate, now]);

  if (!ready) return <Skeleton className="h-[70dvh] w-full" />;
  const { summary } = data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Overview"
        description="What your automations did in the last 30 days."
      />
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Hours saved"
          value={formatHours(summary.hoursSaved)}
          note={`At ${formatCurrency(settings.hourlyRate)} an hour`}
        />
        <StatTile
          label="Value created"
          value={formatCurrency(summary.dollarsSaved)}
          note={`${formatCurrency(summary.recovered)} of it recovered payments`}
        />
        <StatTile
          label="Runs"
          value={formatNumber(summary.runs)}
          note={`${workflows.filter((item) => item.enabled).length} workflows on`}
        />
        <StatTile
          label="Failure rate"
          value={formatPercent(summary.failureRate)}
          note={`${summary.failed} failed runs`}
        />
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-md border border-line bg-surface p-4">
          <DailyRunsChart
            points={data.points}
            title="Runs per day, last 14 days"
          />
        </section>
        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="attention-title"
            className="rounded-md border border-line bg-surface p-4"
          >
            <h2 id="attention-title" className="text-sm font-semibold">
              Needs attention
            </h2>
            {data.failing.length === 0 && data.off.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Nothing right now. Every workflow ran cleanly this week.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col divide-y divide-line">
                {data.failing.map(({ workflow, failed }) => (
                  <AttentionRow
                    key={workflow.id}
                    href={`/app/runs?status=failed&workflow=${workflow.id}`}
                    tone="danger"
                    title={workflow.name}
                    text={`${failed} failed run${failed === 1 ? "" : "s"} this week`}
                  />
                ))}
                {data.off.map((workflow) => (
                  <AttentionRow
                    key={workflow.id}
                    href={`/app/workflows/${workflow.id}`}
                    tone="muted"
                    title={workflow.name}
                    text="Turned off"
                  />
                ))}
              </ul>
            )}
          </section>
          <LimitWatch workflows={workflows} runs={runs} />
        </div>
      </div>

      <section aria-labelledby="recent-title" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 id="recent-title" className="text-lg font-semibold">
            Recent runs
          </h2>
          <Link
            href="/app/runs"
            className="link-underline text-sm text-primary"
          >
            All runs
          </Link>
        </div>
        {runs.length === 0 && (
          <EmptyState
            icon="runs"
            title="No runs yet"
            text="Turn a workflow on or run a test, and its runs will show up here."
            action={
              <Link href="/app/workflows" className="text-primary underline">
                Go to workflows
              </Link>
            }
          />
        )}
        <ul
          className={
            runs.length
              ? "flex flex-col divide-y divide-line rounded-md border border-line bg-surface"
              : "hidden"
          }
        >
          {runs.slice(0, 8).map((run) => (
            <li
              key={run.id}
              className="relative flex items-center justify-between gap-3 px-4 py-3 hover:bg-sunken/60"
            >
              <div className="min-w-0">
                <Link
                  href={`/app/runs/${run.id}`}
                  className="block truncate font-medium after:absolute after:inset-0"
                >
                  {workflows.find((workflow) => workflow.id === run.workflowId)
                    ?.name ?? "Deleted workflow"}
                </Link>
                <span className="text-xs text-muted">
                  {formatDateTime(run.startedAt)}
                </span>
              </div>
              <RunStatus status={run.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function AttentionRow({
  href,
  tone,
  title,
  text,
}: {
  href: string;
  tone: "danger" | "muted";
  title: string;
  text: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-12 items-center gap-3 py-2 hover:text-primary"
      >
        <Icon
          name={tone === "danger" ? "alert" : "info"}
          size={18}
          className={tone === "danger" ? "text-danger" : "text-muted"}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{title}</span>
          <span className="block text-xs text-muted">{text}</span>
        </span>
        <Icon name="chevronRight" size={16} className="text-muted" />
      </Link>
    </li>
  );
}
