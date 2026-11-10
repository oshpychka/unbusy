import type {
  ActionStep,
  AppId,
  Condition,
  DelayStep,
  FilterStep,
  IfStep,
  LoopStep,
  Operator,
  Step,
  SwitchStep,
  TransformStep,
} from "./types";

type ConditionInput = [
  left: string,
  operator: Operator,
  right?: string,
  right2?: string,
];

function conditions(stepId: string, list: ConditionInput[]): Condition[] {
  return list.map(([left, operator, right = "", right2], index) => ({
    id: `${stepId}_c${index + 1}`,
    left,
    operator,
    right,
    right2,
  }));
}

export function action(
  id: string,
  app: AppId,
  operation: string,
  fields: Record<string, string>,
  extra: Partial<
    Pick<ActionStep, "name" | "onError" | "retry" | "fallback">
  > = {},
): ActionStep {
  return { id, type: "action", app, operation, fields, ...extra };
}

export function when(
  id: string,
  name: string,
  list: ConditionInput[],
  then: Step[],
  otherwise: Step[] = [],
  match: IfStep["match"] = "all",
): IfStep {
  return {
    id,
    type: "if",
    name,
    match,
    conditions: conditions(id, list),
    then,
    else: otherwise,
  };
}

export function branch(
  id: string,
  name: string,
  value: string,
  cases: [label: string, equals: string, steps: Step[]][],
  otherwise: Step[] = [],
): SwitchStep {
  return {
    id,
    type: "switch",
    name,
    value,
    cases: cases.map(([label, equals, steps], index) => ({
      id: `${id}_case${index + 1}`,
      label,
      equals,
      steps,
    })),
    otherwise,
  };
}

export function only(
  id: string,
  name: string,
  list: ConditionInput[],
  match: FilterStep["match"] = "all",
): FilterStep {
  return { id, type: "filter", name, match, conditions: conditions(id, list) };
}

export function wait(
  id: string,
  amount: number,
  unit: DelayStep["unit"],
): DelayStep {
  return { id, type: "delay", mode: "for", amount, unit, until: "" };
}

export function waitUntil(id: string, until: string): DelayStep {
  return { id, type: "delay", mode: "until", amount: 0, unit: "hours", until };
}

export function set(
  id: string,
  name: string,
  pairs: [key: string, value: string][],
): TransformStep {
  return {
    id,
    type: "transform",
    name,
    assignments: pairs.map(([key, value], index) => ({
      id: `${id}_a${index + 1}`,
      key,
      value,
    })),
  };
}

export function each(
  id: string,
  name: string,
  list: string,
  steps: Step[],
): LoopStep {
  return { id, type: "loop", name, list, steps };
}
