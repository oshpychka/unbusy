import { describe, expect, it } from "vitest";
import { getPlaybook } from "@/data/playbooks";
import { workflowFromPlaybook } from "./workflow-factory";
import {
  decodeShare,
  encodeShare,
  parseWorkflowFile,
  serializeWorkflow,
  toDraft,
} from "./workflow-io";

const workflow = workflowFromPlaybook(
  getPlaybook("client-onboarding")!,
  "wf",
  "2026-11-10T00:00:00Z",
);

describe("workflow files", () => {
  it("round-trips through export and import", () => {
    const result = parseWorkflowFile(serializeWorkflow(workflow));
    expect(result).toEqual({ ok: true, value: toDraft(workflow) });
  });

  it("rejects foreign, broken and hostile files", () => {
    expect(parseWorkflowFile("not json").ok).toBe(false);
    expect(parseWorkflowFile(JSON.stringify({ name: "x" })).ok).toBe(false);
    const evil = JSON.parse(serializeWorkflow(workflow));
    evil.workflow.steps[0].app = "shell";
    expect(parseWorkflowFile(JSON.stringify(evil))).toEqual({
      ok: false,
      error: "Some steps are broken, unsupported or repeated",
    });
    const duplicate = JSON.parse(serializeWorkflow(workflow));
    duplicate.workflow.steps.push(duplicate.workflow.steps[0]);
    expect(parseWorkflowFile(JSON.stringify(duplicate)).ok).toBe(false);
    expect(parseWorkflowFile("x".repeat(210 * 1024)).ok).toBe(false);
  });

  it("clamps settings", () => {
    const data = JSON.parse(serializeWorkflow(workflow));
    data.workflow.settings.manualMinutes = 99999;
    const result = parseWorkflowFile(JSON.stringify(data));
    expect(result.ok && result.value.settings.manualMinutes).toBe(600);
  });
});

describe("share links", () => {
  it("encode to a compact URL-safe string and decode back", async () => {
    const encoded = await encodeShare(workflow);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(encoded.length).toBeLessThan(
      JSON.stringify(toDraft(workflow)).length,
    );
    expect(await decodeShare(encoded)).toEqual({
      ok: true,
      value: toDraft(workflow),
    });
  });

  it("fail politely on damaged links", async () => {
    const encoded = await encodeShare(workflow);
    expect((await decodeShare(encoded.slice(0, 20))).ok).toBe(false);
    expect((await decodeShare("")).ok).toBe(false);
  });
});
