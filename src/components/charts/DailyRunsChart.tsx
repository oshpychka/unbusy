"use client";

import { useState } from "react";
import type { DayPoint } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import { ChartTooltip, type TooltipState } from "./ChartTooltip";

const height = 180;
const top = 8;
const bottom = 24;

function dayLabel(day: number) {
  return new Date(day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function DailyRunsChart({
  points,
  title,
}: {
  points: DayPoint[];
  title: string;
}) {
  const [tip, setTip] = useState<TooltipState>(null);
  const width = Math.max(points.length * 16, 320);
  const max = Math.max(4, ...points.map((point) => point.runs));
  const step = Math.ceil(max / 3);
  const ticks = [0, step, step * 2, step * 3];
  const scaleMax = ticks[3]!;
  const plot = height - top - bottom;
  const slot = width / points.length;
  const barWidth = Math.max(4, slot - 6);
  const y = (value: number) => top + plot - (value / scaleMax) * plot;

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <span className="flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm bg-chart" />
            Completed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm bg-chart-fail" />
            Failed
          </span>
        </span>
      </figcaption>
      <div className="relative pr-8" onPointerLeave={() => setTip(null)}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[180px] w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={width}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-line"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {points.map((point, index) => {
            const x = index * slot + (slot - barWidth) / 2;
            const ok = point.runs - point.failed;
            const okTop = y(ok);
            const failedTop = y(point.runs);
            return (
              <g key={point.day}>
                {ok > 0 && (
                  <rect
                    x={x}
                    y={okTop}
                    width={barWidth}
                    height={y(0) - okTop}
                    rx={2}
                    className="fill-chart"
                  />
                )}
                {point.failed > 0 && (
                  <rect
                    x={x}
                    y={failedTop}
                    width={barWidth}
                    height={Math.max(1, okTop - failedTop - (ok > 0 ? 2 : 0))}
                    rx={2}
                    className="fill-chart-fail"
                  />
                )}
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-y-0 left-0 right-8 flex">
          {points.map((point) => (
            <span
              key={point.day}
              className="h-full flex-1"
              onPointerEnter={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                const parent =
                  event.currentTarget.parentElement!.getBoundingClientRect();
                setTip({
                  x: box.left - parent.left + box.width / 2,
                  y: Math.max(12, (y(point.runs) / height) * parent.height),
                  title: dayLabel(point.day),
                  lines: [`${point.runs} runs`, `${point.failed} failed`],
                });
              }}
            />
          ))}
        </div>
        <ChartTooltip tip={tip} />
        <div
          className="pointer-events-none absolute right-0 flex w-7 flex-col justify-between text-right text-[11px] leading-none text-muted"
          style={{ top: top - 5, bottom: bottom - 5 }}
        >
          {[...ticks].reverse().map((tick) => (
            <span key={tick}>{formatNumber(tick)}</span>
          ))}
        </div>
      </div>
      <div className="flex justify-between pr-8 text-[11px] text-muted">
        <span>{dayLabel(points[0]!.day)}</span>
        <span>{dayLabel(points[Math.floor(points.length / 2)]!.day)}</span>
        <span>{dayLabel(points[points.length - 1]!.day)}</span>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-xs text-muted">
          Show as table
        </summary>
        <table className="mt-2 w-full text-xs">
          <thead className="text-left text-muted">
            <tr>
              <th scope="col" className="py-1 font-medium">
                Day
              </th>
              <th scope="col" className="font-medium">
                Runs
              </th>
              <th scope="col" className="font-medium">
                Failed
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.day} className="border-t border-line">
                <td className="py-1">{dayLabel(point.day)}</td>
                <td>{point.runs}</td>
                <td>{point.failed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
