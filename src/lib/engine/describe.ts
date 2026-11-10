import { getApp } from "@/data/apps";
import type { Step, Trigger } from "./types";

export const stepTypeLabels: Record<Step["type"], string> = {
  action: "Action",
  if: "If / else",
  switch: "Switch",
  filter: "Filter",
  delay: "Delay",
  transform: "Set fields",
  loop: "Repeat for each",
};

export function operationOf(step: Extract<Step, { type: "action" }>) {
  return getApp(step.app).operations.find(
    (operation) => operation.id === step.operation,
  );
}

export function triggerEventOf(trigger: Trigger) {
  return getApp(trigger.app).events.find((event) => event.id === trigger.event);
}

export function stepTitle(step: Step) {
  if (step.name) return step.name;
  switch (step.type) {
    case "action":
      return operationOf(step)?.label ?? "Action";
    case "delay":
      return step.mode === "for"
        ? `Wait ${step.amount} ${step.unit}`
        : "Wait until a time";
    default:
      return stepTypeLabels[step.type];
  }
}

export function stepSubtitle(step: Step) {
  switch (step.type) {
    case "action":
      return `${getApp(step.app).name} · ${operationOf(step)?.label ?? step.operation}`;
    case "delay":
      return step.mode === "for"
        ? `${step.amount} ${step.unit}`
        : `Until ${step.until}`;
    case "if":
    case "filter":
      return `${step.conditions.length} condition${step.conditions.length === 1 ? "" : "s"}`;
    case "switch":
      return `${step.cases.length} case${step.cases.length === 1 ? "" : "s"}`;
    case "loop":
      return step.list;
    case "transform":
      return step.assignments.map((assignment) => assignment.key).join(", ");
  }
}

export function stepIcon(step: Step) {
  switch (step.type) {
    case "action":
      return getApp(step.app).icon;
    case "if":
    case "switch":
      return "branch";
    case "filter":
      return "filter";
    case "delay":
      return "timer";
    case "transform":
      return "transform";
    case "loop":
      return "loop";
  }
}
