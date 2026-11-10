import { describe, expect, it } from "vitest";
import { commandItems, filterCommands } from "./command-items";

const noop = () => {};
const items = commandItems(
  [
    {
      id: "wf_1",
      name: "Chase unpaid invoices",
      description: "late payments",
    } as never,
  ],
  {
    go: noop,
    newWorkflow: noop,
    usePlaybook: noop,
    toggleTheme: noop,
  },
);

describe("filterCommands", () => {
  it("hides playbooks until the user searches", () => {
    expect(
      filterCommands(items, "").some((item) => item.group === "Playbooks"),
    ).toBe(false);
  });

  it("matches every word in label, group or keywords", () => {
    expect(
      filterCommands(items, "chase invoices").map((item) => item.id),
    ).toContain("wf-wf_1");
    expect(
      filterCommands(items, "late payments").map((item) => item.id),
    ).toContain("wf-wf_1");
    expect(filterCommands(items, "dark").map((item) => item.id)).toEqual([
      "theme",
    ]);
    expect(filterCommands(items, "zzz")).toEqual([]);
  });
});
