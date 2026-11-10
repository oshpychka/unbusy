import { describe, expect, it } from "vitest";
import { apps, getApp } from "@/data/apps";
import { allSteps } from "@/lib/engine/tree";
import { playbooks } from ".";

describe("playbooks", () => {
  it("keeps slugs stable", () => {
    expect(playbooks.map((playbook) => playbook.slug)).toEqual([
      "chase-unpaid-invoices",
      "instant-lead-response",
      "appointment-reminders",
      "review-requests",
      "client-onboarding",
      "monthly-client-report",
      "content-brief-intake",
      "retainer-budget-watch",
      "trial-nurture",
      "failed-payment-recovery",
      "churn-risk-alert",
      "support-escalation",
    ]);
  });

  it("has four playbooks per industry", () => {
    for (const industry of ["service", "agency", "saas"]) {
      expect(
        playbooks.filter((playbook) => playbook.industry === industry),
      ).toHaveLength(4);
    }
  });

  it("links only to existing playbooks", () => {
    const slugs = new Set(playbooks.map((playbook) => playbook.slug));
    for (const playbook of playbooks) {
      expect(
        playbook.related.every(
          (slug) => slugs.has(slug) && slug !== playbook.slug,
        ),
      ).toBe(true);
    }
  });

  it("uses known triggers and operations with unique step ids", () => {
    for (const playbook of playbooks) {
      const trigger = getApp(playbook.trigger.app).events.find(
        (event) => event.id === playbook.trigger.event,
      );
      expect(trigger, playbook.slug).toBeDefined();

      const steps = allSteps(playbook.steps);
      expect(new Set(steps.map((step) => step.id)).size, playbook.slug).toBe(
        steps.length,
      );

      for (const step of steps) {
        if (step.type !== "action") continue;
        const app = apps.find((item) => item.id === step.app);
        expect(
          app?.operations.some((operation) => operation.id === step.operation),
          `${playbook.slug}/${step.id}`,
        ).toBe(true);
      }
    }
  });
});
