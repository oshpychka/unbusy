export type Schedule =
  | { kind: "minutes" | "hours"; every: number }
  | { kind: "daily" | "weekdays"; time: string }
  | { kind: "weekly"; day: number; time: string }
  | { kind: "monthly"; day: number; time: string };

export const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const timePattern = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function validTime(value: string | undefined) {
  return value !== undefined && timePattern.test(value);
}

export function parseSchedule(text: string): Schedule | null {
  const value = text.trim().toLowerCase().replace(/\s+/g, " ");
  let match = value.match(/^every (\d+) (minutes|hours)$/);
  if (match) {
    const every = Number(match[1]);
    const kind = match[2] as "minutes" | "hours";
    const max = kind === "minutes" ? 59 : 23;
    return every >= 1 && every <= max ? { kind, every } : null;
  }
  match = value.match(/^(daily|weekdays) at (\S+)$/);
  if (match && validTime(match[2]))
    return { kind: match[1] as "daily" | "weekdays", time: match[2]! };
  match = value.match(/^weekly on (\w+) at (\S+)$/);
  if (match && weekdays.includes(match[1]!) && validTime(match[2])) {
    return {
      kind: "weekly",
      day: weekdays.indexOf(match[1]!),
      time: match[2]!,
    };
  }
  match = value.match(/^monthly on day (\d+) at (\S+)$/);
  if (match && validTime(match[2])) {
    const day = Number(match[1]);
    return day >= 1 && day <= 28
      ? { kind: "monthly", day, time: match[2]! }
      : null;
  }
  return null;
}

export function formatSchedule(schedule: Schedule): string {
  switch (schedule.kind) {
    case "minutes":
    case "hours":
      return `every ${schedule.every} ${schedule.kind}`;
    case "daily":
    case "weekdays":
      return `${schedule.kind} at ${schedule.time}`;
    case "weekly":
      return `weekly on ${weekdays[schedule.day]} at ${schedule.time}`;
    case "monthly":
      return `monthly on day ${schedule.day} at ${schedule.time}`;
  }
}

function clock(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function describeSchedule(schedule: Schedule): string {
  switch (schedule.kind) {
    case "minutes":
    case "hours":
      return schedule.every === 1
        ? `Every ${schedule.kind.slice(0, -1)}`
        : `Every ${schedule.every} ${schedule.kind}`;
    case "daily":
      return `Every day at ${clock(schedule.time)}`;
    case "weekdays":
      return `Monday to Friday at ${clock(schedule.time)}`;
    case "weekly":
      return `Every ${capitalize(weekdays[schedule.day]!)} at ${clock(schedule.time)}`;
    case "monthly":
      return `On day ${schedule.day} of every month at ${clock(schedule.time)}`;
  }
}

function atTime(date: Date, time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function matchesDay(schedule: Schedule, date: Date) {
  switch (schedule.kind) {
    case "weekdays":
      return date.getDay() >= 1 && date.getDay() <= 5;
    case "weekly":
      return date.getDay() === schedule.day;
    case "monthly":
      return date.getDate() === schedule.day;
    default:
      return true;
  }
}

export function nextRuns(
  schedule: Schedule,
  from: Date,
  count: number,
): Date[] {
  const runs: Date[] = [];
  if ("every" in schedule) {
    const step =
      schedule.every * (schedule.kind === "minutes" ? 60_000 : 3_600_000);
    let next = Math.ceil((from.getTime() + 1) / step) * step;
    while (runs.length < count) {
      runs.push(new Date(next));
      next += step;
    }
    return runs;
  }
  const time = schedule.time;
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  for (let guard = 0; runs.length < count && guard < 400; guard++) {
    const candidate = atTime(cursor, time);
    if (candidate > from && matchesDay(schedule, candidate))
      runs.push(candidate);
    cursor.setDate(cursor.getDate() + 1);
  }
  return runs;
}
