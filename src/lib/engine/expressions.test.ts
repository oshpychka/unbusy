import { describe, expect, it } from "vitest";
import { renderText, renderValue, tokensIn, type Context } from "./expressions";

const context: Context = {
  trigger: {
    name: "Maya Okafor",
    amount: 1850,
    due: "2026-10-01T00:00:00Z",
    tags: ["vip"],
    empty: "",
  },
  steps: { lookup: { owner: "Jordan Reyes", count: 3 } },
  item: { email: "a@example.com" },
  run: { now: "2026-11-10T15:00:00Z" },
};

describe("tokensIn", () => {
  it("parses paths and formatters", () => {
    expect(tokensIn("Hi {{ trigger.name | first_word | upper }}")).toEqual([
      {
        raw: "{{ trigger.name | first_word | upper }}",
        path: "trigger.name",
        formatters: ["first_word", "upper"],
      },
    ]);
  });
});

describe("renderValue", () => {
  it("keeps the raw type for a single token", () => {
    expect(renderValue("{{trigger.amount}}", context)).toBe(1850);
    expect(renderValue("{{trigger.tags}}", context)).toEqual(["vip"]);
    expect(renderValue("{{item.email}}", context)).toBe("a@example.com");
  });

  it("returns null for a missing path", () => {
    expect(renderValue("{{trigger.nope}}", context)).toBeNull();
  });
});

describe("renderText", () => {
  it("interpolates several tokens", () => {
    expect(
      renderText(
        "{{trigger.name}} owes {{trigger.amount | currency}}",
        context,
      ),
    ).toBe("Maya Okafor owes $1,850");
  });

  it("formats dates, times and months in UTC", () => {
    expect(renderText("{{trigger.due | date}}", context)).toBe("Oct 1, 2026");
    expect(renderText("{{run.now | time}}", context)).toBe("3:00 PM");
    expect(renderText("{{trigger.due | month}}", context)).toBe("October");
  });

  it("supports formatters with arguments", () => {
    expect(renderText("{{trigger.empty | default:n/a}}", context)).toBe("n/a");
    expect(renderText("{{run.now | add_days:3 | date}}", context)).toBe(
      "Nov 13, 2026",
    );
    expect(renderText("{{run.now | subtract_hours:24}}", context)).toBe(
      "2026-11-09T15:00:00.000Z",
    );
  });

  it("renders missing values as empty text", () => {
    expect(renderText("Owner: {{steps.other.owner}}.", context)).toBe(
      "Owner: .",
    );
  });

  it("throws on unknown formatters", () => {
    expect(() => renderText("{{trigger.name | shout}}", context)).toThrow(
      'Unknown formatter "shout"',
    );
  });
});
