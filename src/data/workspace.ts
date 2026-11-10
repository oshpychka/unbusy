import { getPlaybook } from "@/data/playbooks";
import type { Workflow } from "@/lib/engine/types";
import { workflowFromPlaybook } from "@/lib/workflow-factory";

const seeds = [
  {
    id: "wf_invoices",
    playbook: "chase-unpaid-invoices",
    name: "Chase unpaid invoices",
    daysAgo: 142,
    enabled: true,
  },
  {
    id: "wf_leads",
    playbook: "instant-lead-response",
    name: "Reply to quote requests",
    daysAgo: 131,
    enabled: true,
  },
  {
    id: "wf_reminders",
    playbook: "appointment-reminders",
    name: "Appointment reminders",
    daysAgo: 118,
    enabled: true,
  },
  {
    id: "wf_reviews",
    playbook: "review-requests",
    name: "Review requests",
    daysAgo: 96,
    enabled: true,
  },
  {
    id: "wf_onboarding",
    playbook: "client-onboarding",
    name: "New client onboarding",
    daysAgo: 77,
    enabled: true,
  },
  {
    id: "wf_retainers",
    playbook: "retainer-budget-watch",
    name: "Retainer budget watch",
    daysAgo: 64,
    enabled: true,
  },
  {
    id: "wf_trials",
    playbook: "trial-nurture",
    name: "Trial follow-up",
    daysAgo: 41,
    enabled: true,
  },
  {
    id: "wf_tickets",
    playbook: "support-escalation",
    name: "Ticket routing",
    daysAgo: 23,
    enabled: false,
  },
];

const dayMs = 86_400_000;

export function seedWorkflows(now: number): Workflow[] {
  return seeds.map((seed) => {
    const playbook = getPlaybook(seed.playbook);
    if (!playbook) throw new Error(`Missing playbook ${seed.playbook}`);
    const createdAt = new Date(now - seed.daysAgo * dayMs).toISOString();
    return {
      ...workflowFromPlaybook(playbook, seed.id, createdAt, seed.name),
      enabled: seed.enabled,
    };
  });
}

export const workspaceSeedIds = seeds.map((seed) => seed.id);
