import { describe, expect, it } from "vitest";
import { getPlaybook } from "@/data/playbooks";
import { action, when } from "./build";
import {
  createStep,
  duplicateStep,
  findStep,
  insertStep,
  locateStep,
  moveStep,
  removeStep,
  updateStep,
} from "./edit";
import { scopeAt } from "./scope";
import { allSteps } from "./tree";
import type { Workflow } from "./types";

const steps = [
  action("a", "chat", "post", { channel: "#ops", text: "1" }),
  when(
    "check",
    "Check",
    [["{{trigger.x}}", "gt", "1"]],
    [action("yes", "chat", "post", {})],
    [action("no", "chat", "post", {})],
  ),
  action("b", "chat", "post", {}),
];

describe("tree editing", () => {
  it("inserts into the root and into branches", () => {
    const step = createStep("delay");
    expect(
      insertStep(steps, { parentId: null, branch: "root", index: 1 }, step)[1]
        ?.id,
    ).toBe(step.id);
    const nested = insertStep(
      steps,
      { parentId: "check", branch: "else", index: 0 },
      step,
    );
    expect(locateStep(nested, step.id)).toEqual({
      parentId: "check",
      branch: "else",
      index: 0,
    });
  });

  it("removes nested steps", () => {
    expect(findStep(removeStep(steps, "yes"), "yes")).toBeNull();
  });

  it("moves steps within their list only", () => {
    expect(moveStep(steps, "b", -1).map((step) => step.id)).toEqual([
      "a",
      "b",
      "check",
    ]);
    expect(moveStep(steps, "a", -1).map((step) => step.id)).toEqual([
      "a",
      "check",
      "b",
    ]);
  });

  it("duplicates a branch with fresh ids", () => {
    const result = duplicateStep(steps, "check");
    const ids = allSteps(result).map((step) => step.id);
    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(8);
  });

  it("updates a nested step", () => {
    const result = updateStep(steps, "no", (step) => ({
      ...step,
      name: "Renamed",
    }));
    expect(findStep(result, "no")?.name).toBe("Renamed");
    expect(findStep(steps, "no")?.name).toBeUndefined();
  });
});

describe("scopeAt", () => {
  const playbook = getPlaybook("client-onboarding")!;
  const workflow = {
    trigger: playbook.trigger,
    steps: playbook.steps,
  } as Workflow;

  it("offers trigger fields and outputs of earlier steps", () => {
    const paths = scopeAt(workflow, "welcome").map((field) => field.path);
    expect(paths).toContain("trigger.client_name");
    expect(paths).toContain("steps.kickoff.link");
    expect(paths).not.toContain("steps.checklist.rows");
  });

  it("offers loop item fields inside a loop", () => {
    const paths = scopeAt(workflow, "setup_task").map((field) => field.path);
    expect(paths).toContain("item.task");
    expect(paths).toContain("steps.checklist.count");
  });
});
