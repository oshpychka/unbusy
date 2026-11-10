import type { DataRecord, Json } from "./types";

export type Context = {
  trigger: DataRecord;
  steps: Record<string, DataRecord>;
  item?: Json;
  run: { now: string };
};

const tokenPattern = /\{\{\s*([^}]+?)\s*\}\}/g;
const dayMs = 86_400_000;

export type Token = { raw: string; path: string; formatters: string[] };

export function tokensIn(template: string): Token[] {
  return [...template.matchAll(tokenPattern)].map((match) => {
    const [path = "", ...formatters] = (match[1] ?? "")
      .split("|")
      .map((part) => part.trim());
    return { raw: match[0], path, formatters };
  });
}

export function resolvePath(context: Context, path: string): Json | undefined {
  let current: unknown = context;
  for (const key of path.split(".")) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current as Json | undefined;
}

function toDate(value: Json | undefined) {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? null : date;
}

const formatters: Record<
  string,
  (value: Json | undefined, arg?: string) => Json | undefined
> = {
  currency: (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  },
  number: (value) => {
    const amount = Number(value);
    return Number.isFinite(amount)
      ? new Intl.NumberFormat("en-US").format(amount)
      : value;
  },
  date: (value) => {
    const date = toDate(value);
    return date
      ? date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })
      : value;
  },
  time: (value) => {
    const date = toDate(value);
    return date
      ? date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "UTC",
        })
      : value;
  },
  month: (value) => {
    const date = toDate(value);
    return date
      ? date.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })
      : value;
  },
  upper: (value) => (value == null ? value : String(value).toUpperCase()),
  lower: (value) => (value == null ? value : String(value).toLowerCase()),
  first_word: (value) =>
    value == null ? value : (String(value).trim().split(/\s+/)[0] ?? ""),
  default: (value, arg = "") => (value == null || value === "" ? arg : value),
  add_days: (value, arg = "0") => {
    const date = toDate(value);
    return date
      ? new Date(date.getTime() + Number(arg) * dayMs).toISOString()
      : value;
  },
  subtract_hours: (value, arg = "0") => {
    const date = toDate(value);
    return date
      ? new Date(date.getTime() - Number(arg) * 3_600_000).toISOString()
      : value;
  },
};

export const formatterNames = Object.keys(formatters);

function applyFormatter(value: Json | undefined, formatter: string) {
  const [name = "", ...rest] = formatter.split(":");
  const apply = formatters[name.trim()];
  if (!apply) throw new Error(`Unknown formatter "${name}"`);
  return apply(value, rest.join(":").trim() || undefined);
}

export function evaluateToken(context: Context, token: Token) {
  return token.formatters.reduce<Json | undefined>(
    (value, formatter) => applyFormatter(value, formatter),
    resolvePath(context, token.path),
  );
}

function stringify(value: Json | undefined) {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function renderValue(template: string, context: Context): Json {
  const tokens = tokensIn(template);
  const only = tokens[0];
  if (tokens.length === 1 && only && template.trim() === only.raw) {
    return evaluateToken(context, only) ?? null;
  }
  return renderText(template, context);
}

export function renderText(template: string, context: Context) {
  return template.replace(tokenPattern, (raw) => {
    const token = tokensIn(raw)[0];
    return token ? stringify(evaluateToken(context, token)) : "";
  });
}
