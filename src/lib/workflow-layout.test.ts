import { describe, expect, it } from "vitest";
import { playbooks } from "@/data/playbooks";
import { allSteps } from "@/lib/engine/tree";
import { layoutWorkflow, nodeHeight, nodeWidth } from "./workflow-layout";

describe("layoutWorkflow", () => {
  it("places every step once and never overlaps nodes", () => {
    for (const playbook of playbooks) {
      const layout = layoutWorkflow(playbook.steps);
      expect(layout.nodes).toHaveLength(allSteps(playbook.steps).length + 1);
      for (const a of layout.nodes) {
        for (const b of layout.nodes) {
          if (a === b) continue;
          const overlap =
            Math.abs(a.x - b.x) < nodeWidth && Math.abs(a.y - b.y) < nodeHeight;
          expect(overlap, `${playbook.slug}: ${a.key} / ${b.key}`).toBe(false);
        }
      }
    }
  });

  it("offers an insert slot at the end of the workflow", () => {
    const layout = layoutWorkflow(playbooks[0]!.steps);
    const end = layout.edges.find((edge) => edge.key === "root.end");
    expect(end?.slot).toEqual({
      parentId: null,
      branch: "root",
      index: playbooks[0]!.steps.length,
    });
  });

  it("shows a placeholder for an empty branch", () => {
    const layout = layoutWorkflow(
      playbooks.find((item) => item.slug === "appointment-reminders")!.steps,
    );
    expect(layout.placeholders.map((item) => item.slot)).toEqual([
      { parentId: "not_confirmed", branch: "else", index: 0 },
    ]);
  });
});
