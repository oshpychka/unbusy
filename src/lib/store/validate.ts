import type { Run, Workflow } from "@/lib/engine/types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isWorkflow(value: unknown): value is Workflow {
  if (!isObject(value)) return false;
  const trigger = value.trigger;
  const settings = value.settings;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.enabled === "boolean" &&
    Array.isArray(value.steps) &&
    isObject(trigger) &&
    typeof trigger.app === "string" &&
    typeof trigger.event === "string" &&
    isObject(settings) &&
    typeof settings.manualMinutes === "number"
  );
}

export function isRun(value: unknown): value is Run {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.workflowId === "string" &&
    typeof value.startedAt === "number" &&
    Array.isArray(value.trace)
  );
}
