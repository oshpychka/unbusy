import { describe, expect, it } from "vitest";
import { playbooks } from "@/data/playbooks";
import { workflowFromPlaybook } from "@/lib/workflow-factory";
import { action, each, only, set, wait, when } from "./build";
import { execute } from "./executor";
import { samplePayload } from "./samples";
import type { Step, Workflow } from "./types";

const start = Date.UTC(2026, 10, 10, 9);

function workflow(
  steps: Step[],
  settings: Partial<Workflow["settings"]> = {},
): Workflow {
  return {
    id: "wf_test",
    name: "Test",
    description: "",
    enabled: true,
    trigger: { app: "invoices", event: "overdue", config: {} },
    steps,
    settings: {
      manualMinutes: 5,
      onError: "stop",
      retry: { attempts: 0, backoffMs: 1000 },
      ...settings,
    },
    createdAt: "",
    updatedAt: "",
  };
}

describe("execute", () => {
  it("takes the branch that matches the data", () => {
    const flow = workflow([
      when(
        "late",
        "Late?",
        [["{{trigger.days_overdue}}", "gt", "30"]],
        [
          action("final", "chat", "post", {
            channel: "#billing",
            text: "late",
          }),
        ],
        [
          action("nudge", "chat", "post", {
            channel: "#billing",
            text: "soon",
          }),
        ],
      ),
    ]);
    const late = execute(
      flow,
      { days_overdue: 45 },
      { seed: 1, startedAt: start, failureRate: 0 },
    );
    const early = execute(
      flow,
      { days_overdue: 5 },
      { seed: 1, startedAt: start, failureRate: 0 },
    );

    expect(late.trace.map((entry) => entry.stepId)).toEqual(["late", "final"]);
    expect(late.trace[0]?.branch).toBe("then");
    expect(early.trace.map((entry) => entry.stepId)).toEqual(["late", "nudge"]);
    expect(early.trace[1]?.path).toBe("late.else.0");
  });

  it("passes outputs of earlier steps into later ones", () => {
    const flow = workflow([
      set("compose", "Compose", [
        ["greeting", "Hi {{trigger.name | first_word}}"],
      ]),
      action("post", "chat", "post", {
        channel: "#sales",
        text: "{{steps.compose.greeting}}!",
      }),
    ]);
    const run = execute(
      flow,
      { name: "Grace Kim" },
      { seed: 2, startedAt: start, failureRate: 0 },
    );
    expect(run.trace[1]?.input.text).toBe("Hi Grace!");
  });

  it("stops quietly when a filter does not pass", () => {
    const flow = workflow([
      only("has_phone", "Has phone", [["{{trigger.phone}}", "is_not_empty"]]),
      action("text", "sms", "send", { to: "{{trigger.phone}}", message: "Hi" }),
    ]);
    const run = execute(
      flow,
      { phone: "" },
      { seed: 3, startedAt: start, failureRate: 0 },
    );
    expect(run.status).toBe("filtered");
    expect(run.trace).toHaveLength(1);
  });

  it("moves the virtual clock through waits", () => {
    const run = execute(
      workflow([wait("pause", 3, "days")]),
      {},
      { seed: 4, startedAt: start, failureRate: 0 },
    );
    expect(run.trace[0]?.waitedMs).toBe(3 * 86_400_000);
    expect(run.finishedAt - run.startedAt).toBe(3 * 86_400_000);
  });

  it("runs loop steps once per item with the item in context", () => {
    const flow = workflow([
      action("rows", "sheet", "read_rows", { sheet: "Onboarding checklist" }),
      each("per_row", "Each", "{{steps.rows.rows}}", [
        action("task", "tasks", "create", {
          title: "{{item.task}}",
          assignee: "{{item.owner}}",
        }),
      ]),
    ]);
    const run = execute(
      flow,
      {},
      { seed: 5, startedAt: start, failureRate: 0 },
    );
    const tasks = run.trace.filter((entry) => entry.stepId === "task");
    expect(tasks).toHaveLength(5);
    expect(tasks[0]?.input.title).toBe("Create shared drive folder");
    expect(tasks[4]?.path).toBe("per_row[4].0");
  });

  it("fails the run on a permanent error and names the step", () => {
    const flow = workflow([
      action(
        "text",
        "sms",
        "send",
        { to: "not a phone", message: "Hi" },
        { name: "Text the lead" },
      ),
    ]);
    const run = execute(
      flow,
      {},
      { seed: 6, startedAt: start, failureRate: 0 },
    );
    expect(run.status).toBe("failed");
    expect(run.error).toBe("Text the lead: Invalid phone number");
  });

  it("continues past errors when the policy says so", () => {
    const flow = workflow(
      [
        action("text", "sms", "send", { to: "", message: "Hi" }),
        action("post", "chat", "post", { channel: "#ops", text: "done" }),
      ],
      { onError: "continue" },
    );
    const run = execute(
      flow,
      {},
      { seed: 7, startedAt: start, failureRate: 0 },
    );
    expect(run.status).toBe("success");
    expect(run.trace.map((entry) => entry.status)).toEqual(["failed", "ok"]);
  });

  it("retries transient errors with exponential backoff", () => {
    const flow = workflow(
      [action("post", "chat", "post", { channel: "#ops", text: "hi" })],
      { retry: { attempts: 3, backoffMs: 1000 } },
    );
    const run = execute(
      flow,
      {},
      { seed: 8, startedAt: start, failureRate: 1 },
    );
    expect(run.trace[0]?.attempts).toBe(4);
    expect(run.status).toBe("failed");
    expect(run.finishedAt - run.startedAt).toBeGreaterThanOrEqual(
      1000 + 2000 + 4000,
    );
  });

  it("is deterministic for the same seed", () => {
    const playbook = playbooks[0]!;
    const flow = workflowFromPlaybook(playbook, "wf", "");
    const payload = samplePayload(flow.trigger, 11, start);
    expect(execute(flow, payload, { seed: 11, startedAt: start })).toEqual(
      execute(flow, payload, { seed: 11, startedAt: start }),
    );
  });

  it("runs every playbook on sample data without crashing", () => {
    for (const playbook of playbooks) {
      const flow = workflowFromPlaybook(playbook, playbook.slug, "");
      for (let seed = 1; seed <= 20; seed++) {
        const payload = samplePayload(flow.trigger, seed, start);
        const run = execute(flow, payload, {
          seed,
          startedAt: start,
          failureRate: 0,
        });
        expect(run.status, `${playbook.slug} #${seed}: ${run.error}`).not.toBe(
          "failed",
        );
      }
    }
  });
});

describe("execute with error paths and rate limits", () => {
  const steps = [
    action(
      "text",
      "sms",
      "send",
      { to: "bad", message: "Hi" },
      {
        onError: "fallback",
        fallback: [
          action("note", "chat", "post", {
            channel: "#ops",
            text: "SMS failed",
          }),
        ],
      },
    ),
    action("after", "chat", "post", { channel: "#ops", text: "done" }),
  ];
  const flow: Workflow = {
    id: "wf",
    name: "t",
    description: "",
    enabled: true,
    trigger: { app: "forms", event: "submitted", config: {} },
    steps,
    settings: {
      manualMinutes: 1,
      onError: "stop",
      retry: { attempts: 0, backoffMs: 0 },
    },
    createdAt: "",
    updatedAt: "",
  };

  it("runs the error path and then continues", () => {
    const run = execute(
      flow,
      {},
      { seed: 1, startedAt: start, failureRate: 0 },
    );
    expect(run.status).toBe("success");
    expect(run.trace.map((entry) => entry.stepId)).toEqual([
      "text",
      "note",
      "after",
    ]);
    expect(run.trace[0]?.branch).toBe("fallback");
    expect(run.trace[1]?.path).toBe("text.fallback.0");
  });

  it("records throttling when runs share a limiter", async () => {
    const { createRateLimiter } = await import("./ratelimit");
    const limiter = createRateLimiter();
    const postFlow = {
      ...flow,
      steps: [action("post", "chat", "post", { channel: "#ops", text: "hi" })],
    };
    const runs = Array.from({ length: 5 }, (_, index) =>
      execute(
        postFlow,
        {},
        { seed: index + 1, startedAt: start, failureRate: 0, limiter },
      ),
    );
    expect(runs[0]?.trace[0]?.throttledMs).toBe(0);
    expect(runs[4]?.trace[0]?.throttledMs).toBeGreaterThan(0);
  });
});
