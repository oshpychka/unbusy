import { operationOf } from "./describe";
import { formatterNames, tokensIn } from "./expressions";
import { unknownTokens } from "./preview";
import { scopeAt, type ScopeField } from "./scope";
import type { Condition, Step, Workflow } from "./types";

export type Issue = {
  target: string;
  severity: "error" | "warning";
  message: string;
};

const needsRight = new Set<Condition["operator"]>([
  "equals",
  "not_equals",
  "contains",
  "gt",
  "lt",
  "between",
  "days_since_gt",
  "days_since_lt",
]);

function templateIssues(
  target: string,
  label: string,
  template: string,
  fields: ScopeField[],
): Issue[] {
  const issues: Issue[] = [];
  const unknown = unknownTokens(template, fields);
  if (unknown.length)
    issues.push({
      target,
      severity: "error",
      message: `${label} uses an unknown field: ${unknown.join(", ")}`,
    });
  for (const token of tokensIn(template)) {
    for (const formatter of token.formatters) {
      const name = formatter.split(":")[0]?.trim() ?? "";
      if (!formatterNames.includes(name))
        issues.push({
          target,
          severity: "error",
          message: `${label} uses an unknown formatter "${name}"`,
        });
    }
  }
  return issues;
}

function conditionIssues(
  target: string,
  conditions: Condition[],
  fields: ScopeField[],
): Issue[] {
  return conditions.flatMap((condition, index) => {
    const label = `Condition ${index + 1}`;
    const issues: Issue[] = [];
    if (!condition.left.trim())
      issues.push({
        target,
        severity: "error",
        message: `${label} has nothing to check`,
      });
    if (needsRight.has(condition.operator) && !condition.right.trim()) {
      issues.push({
        target,
        severity: "error",
        message: `${label} needs a value to compare with`,
      });
    }
    if (condition.operator === "between" && !condition.right2?.trim()) {
      issues.push({
        target,
        severity: "error",
        message: `${label} needs an upper value`,
      });
    }
    return [
      ...issues,
      ...templateIssues(target, label, condition.left, fields),
      ...templateIssues(target, label, condition.right, fields),
    ];
  });
}

export function stepIssues(step: Step, workflow: Workflow): Issue[] {
  const fields = scopeAt(workflow, step.id);
  const target = step.id;
  const issues: Issue[] = [];

  switch (step.type) {
    case "action": {
      const operation = operationOf(step);
      if (!operation)
        return [
          {
            target,
            severity: "error",
            message: "This action no longer exists",
          },
        ];
      for (const field of operation.fields) {
        const value = step.fields[field.key] ?? "";
        if (field.required && !value.trim())
          issues.push({
            target,
            severity: "error",
            message: `${field.label} is required`,
          });
        issues.push(...templateIssues(target, field.label, value, fields));
      }
      const policy = step.onError ?? workflow.settings.onError;
      const retries = (step.retry ?? workflow.settings.retry).attempts;
      if (operation.kind === "write" && policy === "stop" && retries === 0) {
        issues.push({
          target,
          severity: "warning",
          message: "No retries: one temporary error will stop the whole run",
        });
      }
      if (step.onError === "fallback" && !step.fallback?.length) {
        issues.push({
          target,
          severity: "warning",
          message: "The error path is empty, so a failure is simply skipped",
        });
      }
      break;
    }
    case "if":
      issues.push(...conditionIssues(target, step.conditions, fields));
      if (!step.then.length && !step.else.length)
        issues.push({
          target,
          severity: "warning",
          message: "Both paths are empty",
        });
      break;
    case "filter":
      issues.push(...conditionIssues(target, step.conditions, fields));
      break;
    case "switch": {
      if (!step.value.trim())
        issues.push({
          target,
          severity: "error",
          message: "Choose a value to check",
        });
      issues.push(...templateIssues(target, "Value", step.value, fields));
      const seen = new Set<string>();
      for (const item of step.cases) {
        const key = item.equals.trim().toLowerCase();
        if (!key)
          issues.push({
            target,
            severity: "error",
            message: `Case "${item.label}" has no value`,
          });
        else if (seen.has(key))
          issues.push({
            target,
            severity: "warning",
            message: `Case "${item.label}" never runs, an earlier case has the same value`,
          });
        seen.add(key);
      }
      break;
    }
    case "delay":
      if (step.mode === "for" && step.amount <= 0)
        issues.push({
          target,
          severity: "error",
          message: "Wait time must be more than zero",
        });
      if (step.mode === "until") {
        if (!step.until.trim())
          issues.push({
            target,
            severity: "error",
            message: "Choose when to resume",
          });
        issues.push(
          ...templateIssues(target, "Resume time", step.until, fields),
        );
      }
      if (step.mode === "for" && step.unit === "days" && step.amount > 30) {
        issues.push({
          target,
          severity: "warning",
          message: "Waits longer than 30 days are easy to forget about",
        });
      }
      break;
    case "transform": {
      const keys = new Set<string>();
      for (const assignment of step.assignments) {
        if (!assignment.key)
          issues.push({
            target,
            severity: "error",
            message: "Every field needs a name",
          });
        else if (keys.has(assignment.key))
          issues.push({
            target,
            severity: "error",
            message: `Field "${assignment.key}" is set twice`,
          });
        keys.add(assignment.key);
        issues.push(
          ...templateIssues(
            target,
            assignment.key || "Value",
            assignment.value,
            fields,
          ),
        );
      }
      break;
    }
    case "loop": {
      const path = tokensIn(step.list)[0]?.path;
      const field = fields.find((item) => item.path === path);
      if (!step.list.trim())
        issues.push({
          target,
          severity: "error",
          message: "Choose a list to repeat over",
        });
      else if (!field)
        issues.push(...templateIssues(target, "List", step.list, fields));
      else if (field.type !== "list")
        issues.push({
          target,
          severity: "error",
          message: `${field.label} is not a list`,
        });
      if (!step.steps.length)
        issues.push({
          target,
          severity: "warning",
          message: "Nothing happens for each item",
        });
      break;
    }
  }
  return issues;
}
