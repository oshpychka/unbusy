import { apps } from "@/data/apps";
import type { Condition, Operator, Step, Trigger, Workflow } from "./types";

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const operators: Operator[] = [
  "equals",
  "not_equals",
  "contains",
  "gt",
  "lt",
  "between",
  "is_empty",
  "is_not_empty",
  "days_since_gt",
  "days_since_lt",
];
const maxSteps = 200;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max = 2000) {
  return typeof value === "string" && value.length <= max;
}

function stringRecord(value: unknown) {
  return isObject(value) && Object.values(value).every((item) => text(item));
}

function validTrigger(value: unknown): value is Trigger {
  if (!isObject(value) || !stringRecord(value.config)) return false;
  const app = apps.find((item) => item.id === value.app);
  return Boolean(app?.events.some((event) => event.id === value.event));
}

function validConditions(value: unknown): value is Condition[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isObject(item) &&
        text(item.id, 80) &&
        text(item.left) &&
        text(item.right) &&
        (item.right2 === undefined || text(item.right2)) &&
        operators.includes(item.operator as Operator),
    )
  );
}

function validSteps(value: unknown, ids: Set<string>): value is Step[] {
  if (!Array.isArray(value)) return false;
  return value.every((raw) => {
    if (
      !isObject(raw) ||
      !text(raw.id, 80) ||
      ids.has(raw.id as string) ||
      ids.size >= maxSteps
    )
      return false;
    if (raw.name !== undefined && !text(raw.name, 80)) return false;
    ids.add(raw.id as string);
    switch (raw.type) {
      case "action": {
        const app = apps.find((item) => item.id === raw.app);
        const known = app?.operations.some(
          (operation) => operation.id === raw.operation,
        );
        const policy =
          raw.onError === undefined ||
          ["stop", "continue", "fallback"].includes(raw.onError as string);
        const retry =
          raw.retry === undefined ||
          (isObject(raw.retry) &&
            typeof raw.retry.attempts === "number" &&
            raw.retry.attempts >= 0 &&
            raw.retry.attempts <= 5 &&
            typeof raw.retry.backoffMs === "number");
        return (
          Boolean(known) &&
          stringRecord(raw.fields) &&
          policy &&
          retry &&
          (raw.fallback === undefined || validSteps(raw.fallback, ids))
        );
      }
      case "if":
        return (
          ["all", "any"].includes(raw.match as string) &&
          validConditions(raw.conditions) &&
          validSteps(raw.then, ids) &&
          validSteps(raw.else, ids)
        );
      case "filter":
        return (
          ["all", "any"].includes(raw.match as string) &&
          validConditions(raw.conditions)
        );
      case "switch":
        return (
          text(raw.value) &&
          Array.isArray(raw.cases) &&
          raw.cases.every(
            (item) =>
              isObject(item) &&
              text(item.id, 80) &&
              text(item.label, 80) &&
              text(item.equals, 200) &&
              validSteps(item.steps, ids),
          ) &&
          validSteps(raw.otherwise, ids)
        );
      case "delay":
        return (
          ["for", "until"].includes(raw.mode as string) &&
          typeof raw.amount === "number" &&
          raw.amount >= 0 &&
          ["minutes", "hours", "days"].includes(raw.unit as string) &&
          text(raw.until)
        );
      case "transform":
        return (
          Array.isArray(raw.assignments) &&
          raw.assignments.every(
            (item) =>
              isObject(item) &&
              text(item.id, 80) &&
              text(item.key, 80) &&
              text(item.value),
          )
        );
      case "loop":
        return text(raw.list) && validSteps(raw.steps, ids);
      default:
        return false;
    }
  });
}

export type WorkflowDraft = Pick<
  Workflow,
  "name" | "description" | "trigger" | "steps" | "settings"
>;

export function validateDraft(value: unknown): Result<WorkflowDraft> {
  if (!isObject(value))
    return { ok: false, error: "The file does not contain a workflow" };
  if (!text(value.name, 80) || !(value.name as string).trim())
    return {
      ok: false,
      error: "The workflow needs a name up to 80 characters",
    };
  if (!validTrigger(value.trigger))
    return { ok: false, error: "The trigger is missing or not supported" };
  if (!validSteps(value.steps, new Set()))
    return {
      ok: false,
      error: "Some steps are broken, unsupported or repeated",
    };
  const settings = value.settings;
  if (
    !isObject(settings) ||
    typeof settings.manualMinutes !== "number" ||
    !["stop", "continue"].includes(settings.onError as string) ||
    !isObject(settings.retry)
  ) {
    return { ok: false, error: "Workflow settings are missing" };
  }
  return {
    ok: true,
    value: {
      name: value.name as string,
      description: text(value.description, 240)
        ? (value.description as string)
        : "",
      trigger: value.trigger,
      steps: value.steps,
      settings: {
        manualMinutes: Math.min(600, Math.max(0, settings.manualMinutes)),
        onError: settings.onError as "stop" | "continue",
        retry: {
          attempts: Math.min(
            5,
            Math.max(0, Number(settings.retry.attempts) || 0),
          ),
          backoffMs: Math.min(
            60_000,
            Math.max(0, Number(settings.retry.backoffMs) || 0),
          ),
        },
      },
    },
  };
}
