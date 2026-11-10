import { sheets } from "@/data/sheets";
import { operationOf, stepTitle, triggerEventOf } from "./describe";
import { branchKeys, listFor } from "./edit";
import { tokensIn } from "./expressions";
import type { Json, OutputField, Step, Workflow } from "./types";

export type ScopeField = {
  path: string;
  label: string;
  group: string;
  type: OutputField["type"];
  sample: Json;
};

function typeOf(value: Json): OutputField["type"] {
  if (Array.isArray(value)) return "list";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "text";
}

function itemFieldsFor(
  loop: Extract<Step, { type: "loop" }>,
  earlier: Step[],
): ScopeField[] {
  const path = tokensIn(loop.list)[0]?.path ?? "";
  const [, sourceId] = path.split(".");
  const source = earlier.find((step) => step.id === sourceId);
  let sample: Json | undefined;
  if (source?.type === "action" && source.app === "sheet")
    sample = sheets[source.fields.sheet ?? ""]?.[0];
  if (!sample && source?.type === "action") {
    const list = operationOf(source)?.outputs.find(
      (field) => field.type === "list",
    )?.sample;
    sample = Array.isArray(list) ? list[0] : undefined;
  }
  if (!sample || typeof sample !== "object" || Array.isArray(sample)) return [];
  return Object.entries(sample).map(([key, value]) => ({
    path: `item.${key}`,
    label: key.replace(/_/g, " "),
    group: "Current item",
    type: typeOf(value),
    sample: value,
  }));
}

function outputsOf(step: Step): ScopeField[] {
  const group = stepTitle(step);
  if (step.type === "action") {
    return (operationOf(step)?.outputs ?? []).map((field) => ({
      path: `steps.${step.id}.${field.path}`,
      label: field.label,
      group,
      type: field.type,
      sample: field.sample,
    }));
  }
  if (step.type === "transform") {
    return step.assignments
      .filter((assignment) => assignment.key)
      .map((assignment) => ({
        path: `steps.${step.id}.${assignment.key}`,
        label: assignment.key.replace(/_/g, " "),
        group,
        type: "text" as const,
        sample: assignment.value,
      }));
  }
  return [];
}

export function scopeAt(
  workflow: Workflow,
  targetId: string | null,
): ScopeField[] {
  const event = triggerEventOf(workflow.trigger);
  const base: ScopeField[] = [
    ...(event?.outputs ?? []).map((field) => ({
      path: `trigger.${field.path}`,
      label: field.label,
      group: "Trigger",
      type: field.type,
      sample: field.sample,
    })),
    {
      path: "run.now",
      label: "Current time",
      group: "Run",
      type: "date",
      sample: "2026-11-10T15:00:00Z",
    },
  ];
  if (targetId === null) return base;

  return search(workflow.steps, targetId, base, []) ?? base;
}

function search(
  steps: Step[],
  targetId: string,
  inherited: ScopeField[],
  seen: Step[],
): ScopeField[] | null {
  let scope = inherited;
  const before = [...seen];
  for (const step of steps) {
    if (step.id === targetId) return scope;
    for (const key of branchKeys(step)) {
      const inner =
        step.type === "loop"
          ? [...scope, ...itemFieldsFor(step, before)]
          : scope;
      const found = search(listFor(step, key) ?? [], targetId, inner, before);
      if (found) return found;
    }
    before.push(step);
    scope = [...scope, ...outputsOf(step)];
  }
  return null;
}
