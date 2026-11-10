import { action, when } from "@/lib/engine/build";
import type { Step, Trigger, Workflow } from "@/lib/engine/types";

const heroTrigger: Trigger = {
  app: "invoices",
  event: "overdue",
  config: {},
};

const heroSteps: Step[] = [
  when(
    "how_late",
    "More than 30 days late?",
    [["{{trigger.days_overdue}}", "gt", "30"]],
    [
      action(
        "final_notice",
        "invoices",
        "send_reminder",
        { number: "{{trigger.number}}", tone: "Final" },
        { name: "Send final notice" },
      ),
      action(
        "tell_billing",
        "chat",
        "post",
        {
          channel: "#billing",
          text: "{{trigger.client_name}} is {{trigger.days_overdue}} days late",
        },
        { name: "Ping #billing" },
      ),
    ],
    [
      action(
        "friendly_nudge",
        "invoices",
        "send_reminder",
        { number: "{{trigger.number}}", tone: "Friendly" },
        { name: "Friendly reminder" },
      ),
    ],
  ),
];

export const heroWorkflow: Workflow = {
  id: "hero",
  name: "Chase unpaid invoices",
  description: "",
  enabled: true,
  trigger: heroTrigger,
  steps: heroSteps,
  settings: {
    manualMinutes: 12,
    onError: "stop",
    retry: { attempts: 0, backoffMs: 0 },
  },
  createdAt: "",
  updatedAt: "",
};

export function heroPayload(daysOverdue: number) {
  return {
    number: "INV-1042",
    client_name: "Harbor Dental Group",
    client_email: "billing@harbordental.example",
    client_phone: "(206) 555-0118",
    amount: 1850,
    due_date: "2026-10-01",
    days_overdue: daysOverdue,
    reminders_sent: 1,
  };
}
