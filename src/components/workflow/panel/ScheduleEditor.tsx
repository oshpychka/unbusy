"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  describeSchedule,
  formatSchedule,
  nextRuns,
  parseSchedule,
  weekdays,
  type Schedule,
} from "@/lib/engine/schedule";
import { PanelSection } from "./PanelSection";

type Kind = Schedule["kind"];

const kinds: { value: Kind; label: string }[] = [
  { value: "minutes", label: "Every few minutes" },
  { value: "hours", label: "Every few hours" },
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Monday to Friday" },
  { value: "weekly", label: "Once a week" },
  { value: "monthly", label: "Once a month" },
];

function fallback(kind: Kind, time = "09:00"): Schedule {
  switch (kind) {
    case "minutes":
      return { kind, every: 15 };
    case "hours":
      return { kind, every: 2 };
    case "weekly":
      return { kind, day: 1, time };
    case "monthly":
      return { kind, day: 1, time };
    default:
      return { kind, time };
  }
}

function padTime(time: string) {
  const [hours = "0", minutes = "00"] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes}`;
}

export function ScheduleEditor({
  rule,
  onChange,
}: {
  rule: string;
  onChange: (rule: string) => void;
}) {
  const schedule = parseSchedule(rule) ?? fallback("weekdays");
  const [now] = useState(() => new Date());
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const set = (next: Schedule) => onChange(formatSchedule(next));
  const time = "time" in schedule ? padTime(schedule.time) : "09:00";

  return (
    <PanelSection title="Schedule">
      <Field id="schedule-kind" label="Runs">
        <Select<Kind>
          id="schedule-kind"
          value={schedule.kind}
          options={kinds}
          onChange={(kind) => set(fallback(kind, time))}
        />
      </Field>

      {"every" in schedule ? (
        <Field
          id="schedule-every"
          label={
            schedule.kind === "minutes"
              ? "Every how many minutes"
              : "Every how many hours"
          }
        >
          <Input
            id="schedule-every"
            inputMode="numeric"
            value={schedule.every}
            onChange={(event) => {
              const max = schedule.kind === "minutes" ? 59 : 23;
              set({
                ...schedule,
                every: Math.min(
                  max,
                  Math.max(1, Math.round(Number(event.target.value)) || 1),
                ),
              });
            }}
          />
        </Field>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {schedule.kind === "weekly" && (
            <Field id="schedule-day" label="Day">
              <Select
                id="schedule-day"
                value={String(schedule.day)}
                options={weekdays.map((day, index) => ({
                  value: String(index),
                  label: day.charAt(0).toUpperCase() + day.slice(1),
                }))}
                onChange={(value) => set({ ...schedule, day: Number(value) })}
              />
            </Field>
          )}
          {schedule.kind === "monthly" && (
            <Field id="schedule-date" label="Day of month" hint="1 to 28">
              <Input
                id="schedule-date"
                inputMode="numeric"
                value={schedule.day}
                onChange={(event) =>
                  set({
                    ...schedule,
                    day: Math.min(
                      28,
                      Math.max(1, Math.round(Number(event.target.value)) || 1),
                    ),
                  })
                }
              />
            </Field>
          )}
          <Field id="schedule-time" label="Time">
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(event) =>
                event.target.value &&
                set({ ...schedule, time: event.target.value })
              }
            />
          </Field>
        </div>
      )}

      <div className="rounded-md border border-line bg-sunken p-3 text-sm">
        <p className="font-medium">{describeSchedule(schedule)}</p>
        <p className="mt-2 text-xs text-muted">
          Next 5 runs, {zone.replace(/_/g, " ")} time
        </p>
        <ol className="mt-1 flex flex-col gap-0.5 font-mono text-xs">
          {nextRuns(schedule, now, 5).map((date) => (
            <li key={date.getTime()}>
              {date.toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </li>
          ))}
        </ol>
      </div>
    </PanelSection>
  );
}
