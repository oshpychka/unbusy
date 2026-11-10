"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/States";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { statsByWorkflow, summarize } from "@/lib/analytics";
import {
  formatCurrency,
  formatDate,
  formatHours,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace";

type Period = "30" | "month";

export function RoiReport() {
  const ready = useWorkspaceReady();
  const { runs, workflows, settings } = useWorkspace();
  const [period, setPeriod] = useState<Period>("30");
  const [now] = useState(() => Date.now());

  const report = useMemo(() => {
    const date = new Date(now);
    const from =
      period === "30"
        ? now - 30 * 86_400_000
        : new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    const scoped = runs.filter((run) => run.startedAt >= from);
    const recovered = scoped
      .filter((run) => run.recovered > 0)
      .sort((a, b) => b.recovered - a.recovered);
    return {
      from,
      summary: summarize(scoped, workflows, settings.hourlyRate),
      rows: statsByWorkflow(scoped, workflows),
      recovered,
    };
  }, [runs, workflows, settings.hourlyRate, period, now]);

  if (!ready) return <Skeleton className="h-[70dvh] w-full" />;
  const { summary } = report;
  const names = new Map(
    workflows.map((workflow) => [workflow.id, workflow.name]),
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 print:max-w-none">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/app/analytics"
          className="inline-flex min-h-11 items-center text-sm text-primary"
        >
          Back to analytics
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Period"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "30", label: "Last 30 days" },
              { value: "month", label: "This month" },
            ]}
          />
          <Button icon="download" onClick={() => window.print()}>
            Print or save as PDF
          </Button>
        </div>
      </div>

      <article className="flex flex-col gap-8 rounded-md border border-line bg-surface p-6 sm:p-10 print:border-0 print:p-0">
        <header className="flex flex-col gap-1 border-b border-line pb-6">
          <p className="text-sm text-muted">Demo workspace</p>
          <h1 className="text-3xl font-bold">Automation report</h1>
          <p className="text-muted">
            {formatDate(report.from)} to {formatDate(now)}. Prepared{" "}
            {formatDate(now)}.
          </p>
        </header>

        <section aria-labelledby="report-summary">
          <h2 id="report-summary" className="text-lg font-semibold">
            Summary
          </h2>
          <p className="mt-2 max-w-prose">
            Workflows ran {formatNumber(summary.runs)} times and handled work
            that would have taken{" "}
            <strong>{formatHours(summary.hoursSaved)}</strong> by hand. At{" "}
            {formatCurrency(settings.hourlyRate)} an hour that is{" "}
            <strong>
              {formatCurrency(summary.hoursSaved * settings.hourlyRate)}
            </strong>
            , plus <strong>{formatCurrency(summary.recovered)}</strong> in
            payments that came in after a reminder or a retried charge.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Value created", formatCurrency(summary.dollarsSaved)],
              ["Hours saved", formatHours(summary.hoursSaved)],
              ["Runs", formatNumber(summary.runs)],
              ["Failure rate", formatPercent(summary.failureRate)],
            ].map(([label, value]) => (
              <div key={label} className="border-l-2 border-primary pl-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="font-display text-2xl font-bold tabular-nums">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="report-workflows">
          <h2 id="report-workflows" className="text-lg font-semibold">
            By workflow
          </h2>
          <table className="mt-3 w-full text-sm">
            <thead className="border-b border-line text-left text-xs text-muted">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Workflow
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Runs
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Failed
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Hours
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {report.rows.map((row) => (
                <tr key={row.workflow.id} className="break-inside-avoid">
                  <td className="py-2 pr-3">{row.workflow.name}</td>
                  <td className="py-2 text-right tabular-nums">{row.runs}</td>
                  <td className="py-2 text-right tabular-nums">{row.failed}</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatNumber(row.hoursSaved, 1)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatCurrency(row.hoursSaved * settings.hourlyRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section
          aria-labelledby="report-recovered"
          className="break-inside-avoid"
        >
          <h2 id="report-recovered" className="text-lg font-semibold">
            Largest recovered payments
          </h2>
          {report.recovered.length === 0 ? (
            <p className="mt-2 text-muted">
              No payments were recovered in this period.
            </p>
          ) : (
            <ol className="mt-3 flex flex-col divide-y divide-line text-sm">
              {report.recovered.slice(0, 8).map((run) => (
                <li key={run.id} className="flex justify-between gap-4 py-2">
                  <span>
                    {String(
                      run.payload.client_name ??
                        run.payload.customer ??
                        "Client",
                    )}
                    , {names.get(run.workflowId)}
                  </span>
                  <span className="tabular-nums">
                    {formatCurrency(run.recovered)}{" "}
                    <span className="text-muted">
                      on {formatDate(run.startedAt)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <footer className="border-t border-line pt-4 text-xs text-muted">
          Hours use the manual minutes set on each workflow. Sample data from
          the Unbusy demo.
        </footer>
      </article>
    </div>
  );
}
