import { describe, expect, it } from "vitest";
import { evaluateAll, evaluateCondition } from "./conditions";
import type { Context } from "./expressions";
import type { Condition } from "./types";

const context: Context = {
  trigger: {
    days: 34,
    status: "Paid",
    note: "Leaking heater",
    flag: false,
    phone: "",
    sent: "2026-11-01T00:00:00Z",
  },
  steps: {},
  run: { now: "2026-11-10T00:00:00Z" },
};

function check(
  left: string,
  operator: Condition["operator"],
  right = "",
  right2?: string,
) {
  return evaluateCondition({ id: "c", left, operator, right, right2 }, context);
}

describe("evaluateCondition", () => {
  it("compares numbers", () => {
    expect(check("{{trigger.days}}", "gt", "30")).toBe(true);
    expect(check("{{trigger.days}}", "lt", "30")).toBe(false);
    expect(check("{{trigger.days}}", "between", "30", "40")).toBe(true);
  });

  it("does not compare text as numbers", () => {
    expect(check("{{trigger.status}}", "gt", "3")).toBe(false);
  });

  it("matches text ignoring case", () => {
    expect(check("{{trigger.status}}", "equals", "paid")).toBe(true);
    expect(check("{{trigger.note}}", "contains", "HEATER")).toBe(true);
    expect(check("{{trigger.status}}", "not_equals", "open")).toBe(true);
  });

  it("treats booleans as text", () => {
    expect(check("{{trigger.flag}}", "equals", "false")).toBe(true);
  });

  it("checks emptiness", () => {
    expect(check("{{trigger.phone}}", "is_empty")).toBe(true);
    expect(check("{{trigger.missing}}", "is_empty")).toBe(true);
    expect(check("{{trigger.note}}", "is_not_empty")).toBe(true);
  });

  it("counts days since a date", () => {
    expect(check("{{trigger.sent}}", "days_since_gt", "7")).toBe(true);
    expect(check("{{trigger.sent}}", "days_since_lt", "7")).toBe(false);
  });
});

describe("evaluateAll", () => {
  const yes: Condition = { id: "a", left: "1", operator: "equals", right: "1" };
  const no: Condition = { id: "b", left: "1", operator: "equals", right: "2" };

  it("supports all and any", () => {
    expect(evaluateAll([yes, no], "all", context)).toBe(false);
    expect(evaluateAll([yes, no], "any", context)).toBe(true);
    expect(evaluateAll([], "all", context)).toBe(true);
  });
});
