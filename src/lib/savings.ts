export type Period = "day" | "week" | "month";

export type SavingsTask = {
  id: string;
  name: string;
  count: number;
  per: Period;
  minutes: number;
};

const perMonth: Record<Period, number> = { day: 21.7, week: 4.33, month: 1 };

export function monthlyHours(task: SavingsTask) {
  return (
    (Math.max(0, task.count) * perMonth[task.per] * Math.max(0, task.minutes)) /
    60
  );
}

export function totals(tasks: SavingsTask[], hourlyRate: number) {
  const hours = tasks.reduce((sum, task) => sum + monthlyHours(task), 0);
  return {
    hoursPerMonth: hours,
    dollarsPerMonth: hours * hourlyRate,
    dollarsPerYear: hours * hourlyRate * 12,
  };
}

const periods: Period[] = ["day", "week", "month"];

export function encodeTasks(tasks: SavingsTask[]) {
  return tasks.map((task) =>
    [task.id, task.count, task.per, task.minutes].join(":"),
  );
}

export function decodeTask(
  value: string,
  names: Record<string, string>,
): SavingsTask | null {
  const [id = "", count = "", per = "", minutes = ""] = value.split(":");
  const name = names[id];
  if (!name || !periods.includes(per as Period)) return null;
  const parsedCount = Number(count);
  const parsedMinutes = Number(minutes);
  if (!Number.isFinite(parsedCount) || !Number.isFinite(parsedMinutes))
    return null;
  return {
    id,
    name,
    count: Math.min(1000, Math.max(0, Math.round(parsedCount))),
    per: per as Period,
    minutes: Math.min(600, Math.max(0, Math.round(parsedMinutes))),
  };
}
