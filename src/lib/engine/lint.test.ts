import { describe, expect, it } from "vitest";
import { playbooks } from "@/data/playbooks";
import { workflowFromPlaybook } from "@/lib/workflow-factory";
import { action, branch, each, when } from "./build";
import { lintWorkflow } from "./lint";
import type { Step, Workflow } from "./types";

function flow(steps: Step[], patch: Partial<Workflow> = {}): Workflow {
  return {
    id: "wf",
    name: "Test",
    description: "",
    enabled: false,
    trigger: { app: "invoices", event: "overdue", config: {} },
    steps,
    settings: {
      manualMinutes: 5,
      onError: "stop",
      retry: { attempts: 2, backoffMs: 1000 },
    },
    createdAt: "",
    updatedAt: "",
    ...patch,
  };
}

function messages(workflow: Workflow) {
  return lintWorkflow(workflow).map(
    (issue) => `${issue.severity}: ${issue.message}`,
  );
}

describe("lintWorkflow", () => {
  it("finds no errors in any playbook", () => {
    for (const playbook of playbooks) {
      const errors = lintWorkflow(
        workflowFromPlaybook(playbook, "wf", ""),
      ).filter((issue) => issue.severity === "error");
      expect(errors, playbook.slug).toEqual([]);
    }
  });

  it("flags required fields and unknown fields", () => {
    const result = messages(
      flow([
        action("mail", "email", "send", {
          to: "{{trigger.nope}}",
          subject: "",
          body: "Hi {{trigger.client_name | shout}}",
        }),
      ]),
    );
    expect(result).toContain("error: To uses an unknown field: trigger.nope");
    expect(result).toContain("error: Subject is required");
    expect(result).toContain(
      'error: Message uses an unknown formatter "shout"',
    );
  });

  it("does not let a step use outputs of later steps", () => {
    const result = messages(
      flow([
        action("post", "chat", "post", {
          channel: "#ops",
          text: "{{steps.later.owner}}",
        }),
        action("later", "crm", "find_contact", { email: "x@example.com" }),
      ]),
    );
    expect(result).toContain(
      "error: Message uses an unknown field: steps.later.owner",
    );
  });

  it("flags incomplete conditions and empty paths", () => {
    const result = messages(
      flow([when("check", "Check", [["", "gt", ""]], [], [])]),
    );
    expect(result).toContain("error: Condition 1 has nothing to check");
    expect(result).toContain(
      "error: Condition 1 needs a value to compare with",
    );
    expect(result).toContain("warning: Both paths are empty");
  });

  it("flags duplicate switch cases and non-list loops", () => {
    const result = messages(
      flow([
        branch("pick", "Pick", "{{trigger.number}}", [
          ["A", "x", []],
          ["B", "X", []],
        ]),
        each("loop", "Loop", "{{trigger.amount}}", []),
      ]),
    );
    expect(result).toContain(
      'warning: Case "B" never runs, an earlier case has the same value',
    );
    expect(result).toContain("error: Amount is not a list");
  });

  it("warns about write actions with no retries that stop the run", () => {
    const result = messages(
      flow([action("post", "chat", "post", { channel: "#ops", text: "hi" })], {
        settings: {
          manualMinutes: 5,
          onError: "stop",
          retry: { attempts: 0, backoffMs: 0 },
        },
      }),
    );
    expect(result).toContain(
      "warning: No retries: one temporary error will stop the whole run",
    );
  });

  it("validates schedule triggers", () => {
    const result = messages(
      flow([], {
        trigger: {
          app: "schedule",
          event: "tick",
          config: { rule: "every now and then" },
        },
      }),
    );
    expect(result).toContain("error: The schedule is not valid");
  });
});
