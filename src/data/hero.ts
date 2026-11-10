import { action, when } from "@/lib/engine/build";
import type { Step, Trigger } from "@/lib/engine/types";

export const heroTrigger: Trigger = {
  app: "invoices",
  event: "overdue",
  config: {},
};

export const heroSteps: Step[] = [
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
