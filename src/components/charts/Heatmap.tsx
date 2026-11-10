"use client";

import { useState } from "react";
import { ChartTooltip, type TooltipState } from "./ChartTooltip";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const levels = [0.08, 0.3, 0.55, 0.8, 1];

function hourLabel(hour: number) {
  return `${hour % 12 || 12}${hour < 12 ? "am" : "pm"}`;
}

export function Heatmap({ grid, title }: { grid: number[][]; title: string }) {
  const [tip, setTip] = useState<TooltipState>(null);
  const max = Math.max(1, ...grid.flat());
  const hours = Array.from({ length: 18 }, (_, index) => index + 6);

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <span className="flex items-center gap-1 text-xs text-muted">
          Fewer
          {levels.map((level) => (
            <span
              key={level}
              aria-hidden
              className="size-3 rounded-[2px] bg-chart"
              style={{ opacity: level }}
            />
          ))}
          More
        </span>
      </figcaption>
      <div
        className="relative overflow-x-auto"
        onPointerLeave={() => setTip(null)}
      >
        <table className="w-full min-w-[520px] table-fixed border-separate border-spacing-[2px] text-[11px]">
          <caption className="sr-only">
            Runs by weekday and hour, 6am to midnight
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-9" />
              {hours.map((hour) => (
                <th key={hour} scope="col" className="font-normal text-muted">
                  {hour % 3 === 0 ? hourLabel(hour) : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, weekday) => (
              <tr key={days[weekday]}>
                <th
                  scope="row"
                  className="pr-1 text-left font-normal text-muted"
                >
                  {days[weekday]}
                </th>
                {hours.map((hour) => {
                  const value = row[hour] ?? 0;
                  const level =
                    value === 0
                      ? 0
                      : levels[
                          Math.min(
                            levels.length - 1,
                            Math.floor((value / max) * levels.length),
                          )
                        ]!;
                  return (
                    <td
                      key={hour}
                      className="h-5 rounded-[3px] bg-sunken p-0"
                      onPointerEnter={(event) => {
                        const cell =
                          event.currentTarget.getBoundingClientRect();
                        const box = event.currentTarget
                          .closest("div")!
                          .getBoundingClientRect();
                        setTip({
                          x: cell.left - box.left + cell.width / 2,
                          y: cell.top - box.top,
                          title: `${days[weekday]}, ${hourLabel(hour)}`,
                          lines: [`${value} runs`],
                        });
                      }}
                    >
                      <span
                        className="block h-5 rounded-[3px] bg-chart"
                        style={{ opacity: level }}
                      />
                      <span className="sr-only">{value} runs</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <ChartTooltip tip={tip} />
      </div>
    </figure>
  );
}
