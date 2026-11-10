import type { AppDefinition } from "@/lib/engine/types";
import { input, out } from "./app-fields";

export const coreApps: AppDefinition[] = [
  {
    id: "forms",
    name: "Forms",
    category: "Built-in",
    description: "Quote requests, contact forms and briefs from your website.",
    icon: "form",
    ratePerMinute: 600,
    events: [
      {
        id: "submitted",
        label: "Form submitted",
        description: "Someone sends a form on your site.",
        config: [
          input("form", "Form", "select", true, [
            "Quote request",
            "Contact",
            "Content brief",
          ]),
        ],
        outputs: [
          out("name", "Name", "text", "Daniel Brooks"),
          out("email", "Email", "text", "daniel.brooks@example.com"),
          out("phone", "Phone", "text", "(737) 555-0162"),
          out("service", "Service", "text", "Water heater install"),
          out("zip", "ZIP code", "text", "78704"),
          out("budget", "Budget", "number", 2400),
          out(
            "message",
            "Message",
            "text",
            "Old heater is leaking, need a quote this week.",
          ),
          out("submitted_at", "Submitted at", "date", "2026-11-09T14:12:00Z"),
        ],
      },
    ],
    operations: [],
  },
  {
    id: "webhook",
    name: "Webhook",
    category: "Developer",
    description: "Receive events from any tool that can send an HTTP request.",
    icon: "webhook",
    ratePerMinute: 600,
    events: [
      {
        id: "call_missed",
        label: "Phone call missed",
        description: "Your phone system reports a missed call.",
        config: [],
        outputs: [
          out("caller_phone", "Caller phone", "text", "(415) 555-0133"),
          out("caller_name", "Caller name", "text", "Priya Natarajan"),
          out("called_at", "Called at", "date", "2026-11-09T16:40:00Z"),
        ],
      },
      {
        id: "ticket_created",
        label: "Support ticket created",
        description: "A new ticket arrives in your help desk.",
        config: [],
        outputs: [
          out("ticket_id", "Ticket ID", "text", "T-30871"),
          out("subject", "Subject", "text", "Exports fail for large accounts"),
          out("priority", "Priority", "text", "urgent"),
          out(
            "customer_email",
            "Customer email",
            "text",
            "ops@northwind.example",
          ),
          out("plan", "Plan", "text", "Business"),
          out("mrr", "Monthly revenue", "number", 900),
        ],
      },
    ],
    operations: [],
  },
  {
    id: "schedule",
    name: "Schedule",
    category: "Built-in",
    description: "Run a workflow on a fixed schedule.",
    icon: "clock",
    ratePerMinute: 600,
    events: [
      {
        id: "tick",
        label: "On a schedule",
        description: "Runs at the times you set.",
        config: [input("rule", "Schedule", "text")],
        outputs: [
          out("run_at", "Run time", "date", "2026-11-01T09:00:00Z"),
          out("period_start", "Period start", "date", "2026-10-01"),
          out("period_end", "Period end", "date", "2026-10-31"),
        ],
      },
    ],
    operations: [],
  },
  {
    id: "monitor",
    name: "Limit monitor",
    category: "Built-in",
    description: "Watch a budget or quota and react before it runs out.",
    icon: "gauge",
    ratePerMinute: 600,
    events: [
      {
        id: "threshold",
        label: "Limit reaches a threshold",
        description: "Fires when usage crosses the warning or alert level.",
        config: [
          input("metric", "Metric", "select", true, [
            "Retainer hours",
            "Ad spend",
            "SMS credits",
            "Monthly budget",
          ]),
          input("limit", "Limit", "number"),
          input("warn_pct", "Warning at, %", "number"),
          input("alert_pct", "Alert at, %", "number"),
        ],
        outputs: [
          out("metric", "Metric", "text", "Retainer hours"),
          out("client", "Client", "text", "Fernwood Bakery"),
          out("used", "Used", "number", 34),
          out("limit", "Limit", "number", 40),
          out("used_pct", "Used, %", "number", 85),
          out("state", "State", "text", "yellow"),
          out("forecast", "Forecast at period end", "number", 46),
        ],
      },
    ],
    operations: [],
  },
  {
    id: "email",
    name: "Email",
    category: "Communication",
    description: "Send email from your team address.",
    icon: "mail",
    ratePerMinute: 60,
    events: [],
    operations: [
      {
        id: "send",
        label: "Send email",
        kind: "write",
        fields: [
          input("to", "To", "email"),
          input("subject", "Subject"),
          input("body", "Message", "longtext"),
        ],
        outputs: [
          out("message_id", "Message ID", "text", "msg_83kd2"),
          out("sent_at", "Sent at", "date", "2026-11-09T14:13:00Z"),
        ],
      },
    ],
  },
  {
    id: "sms",
    name: "SMS",
    category: "Communication",
    description: "Text customers from your business number.",
    icon: "message",
    ratePerMinute: 30,
    events: [],
    operations: [
      {
        id: "send",
        label: "Send text message",
        kind: "write",
        fields: [
          input("to", "To", "phone"),
          input("message", "Message", "longtext"),
        ],
        outputs: [
          out("message_id", "Message ID", "text", "sms_19af0"),
          out("segments", "Segments", "number", 1),
        ],
      },
    ],
  },
];
