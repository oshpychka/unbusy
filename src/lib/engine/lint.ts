import { stepTitle, triggerEventOf } from "./describe";
import { stepIssues, type Issue } from "./lint-steps";
import { parseSchedule } from "./schedule";
import { walkSteps } from "./tree";
import type { Workflow } from "./types";

export type { Issue };

export function lintWorkflow(workflow: Workflow): Issue[] {
  const issues: Issue[] = [];
  const event = triggerEventOf(workflow.trigger);
  if (!event)
    issues.push({
      target: "trigger",
      severity: "error",
      message: "Choose a trigger",
    });
  for (const field of event?.config ?? []) {
    const value = workflow.trigger.config[field.key] ?? "";
    if (field.required && !value.trim())
      issues.push({
        target: "trigger",
        severity: "error",
        message: `${field.label} is required`,
      });
  }
  if (
    workflow.trigger.app === "schedule" &&
    !parseSchedule(workflow.trigger.config.rule ?? "")
  ) {
    issues.push({
      target: "trigger",
      severity: "error",
      message: "The schedule is not valid",
    });
  }
  if (workflow.steps.length === 0)
    issues.push({
      target: "trigger",
      severity: "warning",
      message: "The workflow has no steps yet",
    });
  walkSteps(workflow.steps, (step) =>
    issues.push(...stepIssues(step, workflow)),
  );
  return issues;
}

export function issueTitle(workflow: Workflow, target: string) {
  if (target === "trigger") return "Trigger";
  let title = target;
  walkSteps(workflow.steps, (step) => {
    if (step.id === target) title = stepTitle(step);
  });
  return title;
}
