"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toast } from "@/components/ui/Toaster";
import { playbooks } from "@/data/playbooks";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  decodeTask,
  encodeTasks,
  monthlyHours,
  totals,
  type Period,
  type SavingsTask,
} from "@/lib/savings";

const taskNames: Record<string, string> = {
  ...Object.fromEntries(
    playbooks.map((playbook) => [playbook.slug, playbook.title]),
  ),
  other: "Other repetitive task",
};
const taskOptions = Object.entries(taskNames).map(([value, label]) => ({
  value,
  label,
}));
const periodOptions: { value: Period; label: string }[] = [
  { value: "day", label: "per workday" },
  { value: "week", label: "per week" },
  { value: "month", label: "per month" },
];

function preset(id: string): SavingsTask {
  const playbook = playbooks.find((item) => item.slug === id);
  return {
    id,
    name: taskNames[id] ?? id,
    count: playbook?.monthlyVolume ?? 10,
    per: "month",
    minutes: playbook?.manualMinutes ?? 10,
  };
}

const defaults = [
  "chase-unpaid-invoices",
  "instant-lead-response",
  "appointment-reminders",
].map(preset);

function initialFromParams(params: URLSearchParams) {
  const decoded = params
    .getAll("t")
    .map((value) => decodeTask(value, taskNames))
    .filter((task) => task !== null);
  const rate = Number(params.get("rate"));
  return {
    tasks: decoded.length ? decoded.slice(0, 12) : defaults,
    rate: Number.isFinite(rate) && rate > 0 && rate <= 1000 ? rate : 45,
  };
}

const subscribeToNothing = () => () => {};

export function SavingsCalculator() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSyncExternalStore(
    subscribeToNothing,
    () => window.location.search,
    () => "",
  );
  const fromUrl = useMemo(
    () => initialFromParams(new URLSearchParams(search)),
    [search],
  );
  const [edited, setEdited] = useState<{
    tasks: SavingsTask[];
    rate: number;
  } | null>(null);
  const tasks = edited?.tasks ?? fromUrl.tasks;
  const rate = edited?.rate ?? fromUrl.rate;
  const setTasks = (next: SavingsTask[]) => setEdited({ tasks: next, rate });
  const setRate = (next: number) => setEdited({ tasks, rate: next });
  const result = totals(tasks, rate);

  function sync(nextTasks: SavingsTask[], nextRate: number) {
    const search = new URLSearchParams();
    for (const value of encodeTasks(nextTasks)) search.append("t", value);
    search.set("rate", String(nextRate));
    router.replace(`${pathname}?${search.toString()}`, { scroll: false });
  }

  function update(index: number, patch: Partial<SavingsTask>) {
    const next = tasks.map((task, position) =>
      position === index ? { ...task, ...patch } : task,
    );
    setTasks(next);
    sync(next, rate);
  }

  function clampNumber(value: string, max: number) {
    const number = Math.round(Number(value));
    return Number.isFinite(number) ? Math.min(max, Math.max(0, number)) : 0;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        <ol className="flex flex-col gap-3">
          {tasks.map((task, index) => (
            <li
              key={`${task.id}-${index}`}
              className="grid gap-3 rounded-md border border-line bg-surface p-4 sm:grid-cols-[1fr_auto]"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.6fr)_90px_minmax(0,1fr)_90px]">
                <Field id={`task-${index}`} label="Task">
                  <Select
                    id={`task-${index}`}
                    value={task.id}
                    options={taskOptions}
                    onChange={(id) => update(index, { ...preset(id) })}
                  />
                </Field>
                <Field id={`count-${index}`} label="Times">
                  <Input
                    id={`count-${index}`}
                    inputMode="numeric"
                    value={task.count}
                    onChange={(event) =>
                      update(index, {
                        count: clampNumber(event.target.value, 1000),
                      })
                    }
                  />
                </Field>
                <Field id={`per-${index}`} label="How often">
                  <Select
                    id={`per-${index}`}
                    value={task.per}
                    options={periodOptions}
                    onChange={(per) => update(index, { per })}
                  />
                </Field>
                <Field id={`minutes-${index}`} label="Minutes each">
                  <Input
                    id={`minutes-${index}`}
                    inputMode="numeric"
                    value={task.minutes}
                    onChange={(event) =>
                      update(index, {
                        minutes: clampNumber(event.target.value, 600),
                      })
                    }
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                <span className="text-sm whitespace-nowrap text-muted">
                  {formatNumber(monthlyHours(task), 1)} h/mo
                </span>
                <IconButton
                  icon="trash"
                  label={`Remove ${task.name}`}
                  disabled={tasks.length === 1}
                  onClick={() => {
                    const next = tasks.filter(
                      (_, position) => position !== index,
                    );
                    setTasks(next);
                    sync(next, rate);
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
        <Button
          variant="secondary"
          icon="plus"
          className="self-start"
          disabled={tasks.length >= 12}
          onClick={() => {
            const unused = playbooks.find(
              (playbook) => !tasks.some((task) => task.id === playbook.slug),
            );
            const next = [...tasks, preset(unused?.slug ?? "other")];
            setTasks(next);
            sync(next, rate);
          }}
        >
          Add a task
        </Button>
      </div>

      <aside
        className="flex flex-col gap-4 rounded-md border border-line bg-surface p-5 lg:sticky lg:top-24 lg:self-start"
        aria-live="polite"
      >
        <Field
          id="rate"
          label="Cost of an hour, USD"
          hint="Wage plus overhead for whoever does this work."
        >
          <Input
            id="rate"
            inputMode="decimal"
            value={rate}
            onChange={(event) => {
              const value = Math.min(
                1000,
                Math.max(0, Number(event.target.value) || 0),
              );
              setRate(value);
              sync(tasks, value);
            }}
          />
        </Field>
        <dl className="grid grid-cols-2 gap-4 border-t border-line pt-4">
          <div>
            <dt className="text-xs text-muted">Hours a month</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">
              {formatNumber(result.hoursPerMonth, 1)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Per month</dt>
            <dd className="font-display text-3xl font-bold tabular-nums">
              {formatCurrency(result.dollarsPerMonth)}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-muted">Per year</dt>
            <dd className="font-display text-4xl font-bold tabular-nums">
              {formatCurrency(result.dollarsPerYear)}
            </dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          icon="share"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              toast("Link copied", "success");
            } catch {
              toast("Could not copy the link", "danger");
            }
          }}
        >
          Copy link to this estimate
        </Button>
      </aside>
    </div>
  );
}
