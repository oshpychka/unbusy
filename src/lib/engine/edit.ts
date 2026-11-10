import { getApp } from "@/data/apps";
import type { AppId, Step, StepType } from "./types";

export type Slot = { parentId: string | null; branch: string; index: number };

function shortId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 6)}`;
}

export function listFor(step: Step, branch: string): Step[] | null {
  switch (step.type) {
    case "if":
      return branch === "then"
        ? step.then
        : branch === "else"
          ? step.else
          : null;
    case "switch":
      return branch === "otherwise"
        ? step.otherwise
        : (step.cases.find((item) => item.id === branch)?.steps ?? null);
    case "loop":
      return branch === "steps" ? step.steps : null;
    case "action":
      return branch === "fallback" ? (step.fallback ?? null) : null;
    default:
      return null;
  }
}

function mapLists(step: Step, map: (list: Step[]) => Step[]): Step {
  switch (step.type) {
    case "if":
      return { ...step, then: map(step.then), else: map(step.else) };
    case "switch":
      return {
        ...step,
        cases: step.cases.map((item) => ({ ...item, steps: map(item.steps) })),
        otherwise: map(step.otherwise),
      };
    case "loop":
      return { ...step, steps: map(step.steps) };
    case "action":
      return step.fallback ? { ...step, fallback: map(step.fallback) } : step;
    default:
      return step;
  }
}

function transform(
  steps: Step[],
  fn: (list: Step[], parentId: string | null, branch: string) => Step[],
  parentId: string | null = null,
  branch = "root",
): Step[] {
  const mapped = fn(steps, parentId, branch).map((step) => {
    const branches = branchKeys(step);
    if (branches.length === 0) return step;
    let next = step;
    for (const key of branches) {
      const list = listFor(next, key);
      if (!list) continue;
      next = replaceList(next, key, transform(list, fn, step.id, key));
    }
    return next;
  });
  return mapped;
}

export function branchKeys(step: Step): string[] {
  switch (step.type) {
    case "if":
      return ["then", "else"];
    case "switch":
      return [...step.cases.map((item) => item.id), "otherwise"];
    case "loop":
      return ["steps"];
    case "action":
      return step.fallback ? ["fallback"] : [];
    default:
      return [];
  }
}

function replaceList(step: Step, branch: string, list: Step[]): Step {
  switch (step.type) {
    case "if":
      return branch === "then"
        ? { ...step, then: list }
        : { ...step, else: list };
    case "switch":
      return branch === "otherwise"
        ? { ...step, otherwise: list }
        : {
            ...step,
            cases: step.cases.map((item) =>
              item.id === branch ? { ...item, steps: list } : item,
            ),
          };
    case "loop":
      return { ...step, steps: list };
    case "action":
      return { ...step, fallback: list };
    default:
      return step;
  }
}

export function insertStep(steps: Step[], slot: Slot, step: Step): Step[] {
  return transform(steps, (list, parentId, branch) => {
    if (parentId !== slot.parentId || branch !== slot.branch) return list;
    const next = [...list];
    next.splice(Math.min(slot.index, next.length), 0, step);
    return next;
  });
}

export function removeStep(steps: Step[], id: string): Step[] {
  return transform(steps, (list) => list.filter((step) => step.id !== id));
}

export function updateStep(
  steps: Step[],
  id: string,
  update: (step: Step) => Step,
): Step[] {
  return transform(steps, (list) =>
    list.map((step) => (step.id === id ? update(step) : step)),
  );
}

export function moveStep(steps: Step[], id: string, direction: -1 | 1): Step[] {
  return transform(steps, (list) => {
    const index = list.findIndex((step) => step.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= list.length) return list;
    const next = [...list];
    [next[index], next[target]] = [next[target]!, next[index]!];
    return next;
  });
}

function cloneWithNewIds(step: Step): Step {
  const copy = { ...step, id: shortId(step.type) } as Step;
  return mapLists(copy, (list) => list.map(cloneWithNewIds));
}

export function duplicateStep(steps: Step[], id: string): Step[] {
  return transform(steps, (list) => {
    const index = list.findIndex((step) => step.id === id);
    if (index === -1) return list;
    const next = [...list];
    next.splice(index + 1, 0, cloneWithNewIds(structuredClone(list[index]!)));
    return next;
  });
}

export function findStep(steps: Step[], id: string): Step | null {
  for (const step of steps) {
    if (step.id === id) return step;
    for (const key of branchKeys(step)) {
      const found = findStep(listFor(step, key) ?? [], id);
      if (found) return found;
    }
  }
  return null;
}

export function locateStep(
  steps: Step[],
  id: string,
  parentId: string | null = null,
  branch = "root",
): Slot | null {
  for (const [index, step] of steps.entries()) {
    if (step.id === id) return { parentId, branch, index };
    for (const key of branchKeys(step)) {
      const found = locateStep(listFor(step, key) ?? [], id, step.id, key);
      if (found) return found;
    }
  }
  return null;
}

export function createStep(
  type: StepType,
  app?: AppId,
  operation?: string,
): Step {
  const id = shortId(type === "action" ? (operation ?? "action") : type);
  switch (type) {
    case "action": {
      const appId = app ?? "email";
      const op = operation ?? getApp(appId).operations[0]?.id ?? "";
      return { id, type, app: appId, operation: op, fields: {} };
    }
    case "if":
      return {
        id,
        type,
        match: "all",
        conditions: [
          { id: `${id}_c1`, left: "", operator: "equals", right: "" },
        ],
        then: [],
        else: [],
      };
    case "switch":
      return {
        id,
        type,
        value: "",
        cases: [{ id: `${id}_case1`, label: "Case 1", equals: "", steps: [] }],
        otherwise: [],
      };
    case "filter":
      return {
        id,
        type,
        match: "all",
        conditions: [
          { id: `${id}_c1`, left: "", operator: "is_not_empty", right: "" },
        ],
      };
    case "delay":
      return { id, type, mode: "for", amount: 1, unit: "hours", until: "" };
    case "transform":
      return {
        id,
        type,
        assignments: [{ id: `${id}_a1`, key: "value", value: "" }],
      };
    case "loop":
      return { id, type, list: "", steps: [] };
  }
}
