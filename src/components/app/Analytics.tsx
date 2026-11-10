"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarList } from "@/components/charts/BarList";
import { DailyRunsChart } from "@/components/charts/DailyRunsChart";
import { Heatmap } from "@/components/charts/Heatmap";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/States";
import { useUrlState } from "@/hooks/useUrlState";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import {
  heatmap,
  runsByDay,
  runsSince,
  statsByWorkflow,
  summarize,
} from "@/lib/analytics";
import {
  formatCurrency,
  formatHours,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace";
import { LimitWatch } from "./LimitWatch";
import { PageHeader } from "./PageHeader";
import { StatTile } from "./StatTile";

const ranges = ["30", "7"] as const;

export function Analytics() {
  const ready = useWorkspaceReady();
  const { runs, workflows, settings } = useWorkspace();
  const [range, setRange] = useUrlState("days", "30", ranges);
  const [now] = useState(() => Date.now());
  const days = Number(range);

  const data = useMemo(() => {
    const scoped = runsSince(runs, now - days * 86_400_000);
    return {
      summary: summarize(scoped, workflows, settings.hourlyRate),
      points: runsByDay(scoped, days, now),
      byWorkflow: statsByWorkflow(scoped, workflows),
      grid: heatmap(scoped),
    };
  }, [runs, workflows, settings.hourlyRate, days, now]);

  if (!ready) return <Skeleton className="h-[70dvh] w-full" />;
  const { summary } = data;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Analytics"
        description="Hours and dollars your workflows saved."
        actions={
          <Segmented
            label="Period"
            value={range}
            onChange={setRange}
            options={[
              { value: "30", label: "30 days" },
              { value: "7", label: "7 days" },
            ]}
          />
        }
      />
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Hours saved"
          value={formatHours(summary.hoursSaved)}
          note="Manual minutes per run, completed runs only"
        />
        <StatTile
          label="Value created"
          value={formatCurrency(summary.dollarsSaved)}
          note={`Time at ${formatCurrency(settings.hourlyRate)}/h plus recovered payments`}
        />
        <StatTile
          label="Payments recovered"
          value={formatCurrency(summary.recovered)}
          note="Paid after a reminder or retry"
        />
        <StatTile
          label="Failure rate"
          value={formatPercent(summary.failureRate)}
          note={`${formatNumber(summary.failed)} of ${formatNumber(summary.runs)} runs`}
        />
      </dl>
      <p className="-mt-4 text-xs text-muted">
        Hourly rate comes from{" "}
        <Link href="/app/settings" className="text-primary underline">
          settings
        </Link>
        .
      </p>

      <section className="rounded-md border border-line bg-surface p-4">
        <DailyRunsChart
          points={data.points}
          title={`Runs per day, last ${days} days`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-surface p-4">
          <BarList
            title="Hours saved by workflow"
            items={data.byWorkflow.map((item) => ({
              key: item.workflow.id,
              label: item.workflow.name,
              value: item.hoursSaved,
              display: formatHours(item.hoursSaved),
              href: `/app/workflows/${item.workflow.id}`,
            }))}
          />
        </section>
        <section className="rounded-md border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold">Reliability by workflow</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th scope="col" className="pb-2 font-medium">
                  Workflow
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Runs
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Failed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.byWorkflow.map((item) => (
                <tr key={item.workflow.id}>
                  <td className="max-w-0 truncate py-2 pr-3">
                    {item.workflow.name}
                  </td>
                  <td className="py-2 text-right tabular-nums">{item.runs}</td>
                  <td
                    className={
                      item.failed
                        ? "py-2 text-right text-danger tabular-nums"
                        : "py-2 text-right text-muted tabular-nums"
                    }
                  >
                    {item.failed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="min-w-0 rounded-md border border-line bg-surface p-4">
          <Heatmap grid={data.grid} title="When workflows run" />
        </section>
        <LimitWatch workflows={workflows} runs={runs} />
      </div>
    </div>
  );
}
