import { renderValue, type Context } from "./expressions";
import type { Condition, Json } from "./types";

const dayMs = 86_400_000;

function asNumber(value: Json) {
  if (typeof value === "number") return value;
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    Number.isFinite(Number(value))
  )
    return Number(value);
  return null;
}

function normalize(value: Json) {
  if (value === null) return "";
  if (typeof value === "object") return JSON.stringify(value).toLowerCase();
  return String(value).trim().toLowerCase();
}

function isEmpty(value: Json) {
  return (
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function daysSince(value: Json, now: number) {
  const time = new Date(String(value)).getTime();
  return Number.isNaN(time) ? null : (now - time) / dayMs;
}

export function evaluateCondition(
  condition: Condition,
  context: Context,
): boolean {
  const left = renderValue(condition.left, context);
  const right = renderValue(condition.right, context);
  const now = new Date(context.run.now).getTime();

  switch (condition.operator) {
    case "equals":
      return normalize(left) === normalize(right);
    case "not_equals":
      return normalize(left) !== normalize(right);
    case "contains":
      return normalize(left).includes(normalize(right));
    case "gt":
    case "lt": {
      const a = asNumber(left);
      const b = asNumber(right);
      if (a === null || b === null) return false;
      return condition.operator === "gt" ? a > b : a < b;
    }
    case "between": {
      const value = asNumber(left);
      const low = asNumber(right);
      const high = asNumber(renderValue(condition.right2 ?? "", context));
      return (
        value !== null &&
        low !== null &&
        high !== null &&
        value >= low &&
        value <= high
      );
    }
    case "is_empty":
      return isEmpty(left);
    case "is_not_empty":
      return !isEmpty(left);
    case "days_since_gt":
    case "days_since_lt": {
      const days = daysSince(left, now);
      const limit = asNumber(right);
      if (days === null || limit === null) return false;
      return condition.operator === "days_since_gt"
        ? days > limit
        : days < limit;
    }
  }
}

export function evaluateAll(
  conditions: Condition[],
  match: "all" | "any",
  context: Context,
) {
  if (conditions.length === 0) return true;
  return match === "all"
    ? conditions.every((condition) => evaluateCondition(condition, context))
    : conditions.some((condition) => evaluateCondition(condition, context));
}

export const operatorLabels: Record<Condition["operator"], string> = {
  equals: "is",
  not_equals: "is not",
  contains: "contains",
  gt: "is greater than",
  lt: "is less than",
  between: "is between",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  days_since_gt: "was more than N days ago",
  days_since_lt: "was less than N days ago",
};
