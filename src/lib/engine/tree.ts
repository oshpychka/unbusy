import type { Step } from "./types";

export function childLists(step: Step): Step[][] {
  switch (step.type) {
    case "if":
      return [step.then, step.else];
    case "switch":
      return [...step.cases.map((item) => item.steps), step.otherwise];
    case "loop":
      return [step.steps];
    case "action":
      return step.fallback ? [step.fallback] : [];
    default:
      return [];
  }
}

export function walkSteps(
  steps: Step[],
  visit: (step: Step, depth: number) => void,
  depth = 0,
) {
  for (const step of steps) {
    visit(step, depth);
    for (const list of childLists(step)) walkSteps(list, visit, depth + 1);
  }
}

export function allSteps(steps: Step[]) {
  const result: Step[] = [];
  walkSteps(steps, (step) => result.push(step));
  return result;
}
