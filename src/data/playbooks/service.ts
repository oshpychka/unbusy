import { action, only, set, wait, waitUntil, when } from "@/lib/engine/build";
import type { Playbook } from "./types";

export const servicePlaybooks: Playbook[] = [
  {
    slug: "chase-unpaid-invoices",
    title: "Chase unpaid invoices",
    industry: "service",
    summary:
      "Send the right reminder for how late an invoice is, and hand the worst cases to a person.",
    problem:
      "Late invoices sit until someone has a free afternoon to write awkward emails. By then a 10-day delay has turned into 45.",
    outcome:
      "Friendly nudges go out on time, final notices are escalated to the account owner with a call task.",
    manualMinutes: 12,
    monthlyVolume: 25,
    trigger: { app: "invoices", event: "overdue", config: {} },
    steps: [
      action(
        "find_owner",
        "crm",
        "find_contact",
        { email: "{{trigger.client_email}}" },
        { name: "Find the client in CRM" },
      ),
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
              text: "{{trigger.client_name}} is {{trigger.days_overdue}} days late on {{trigger.number}} ({{trigger.amount | currency}}). Final notice sent.",
            },
            { name: "Tell the billing channel" },
          ),
          action(
            "call_task",
            "tasks",
            "create",
            {
              title: "Call {{trigger.client_name}} about {{trigger.number}}",
              assignee: "{{steps.find_owner.owner}}",
              due_in_days: "1",
            },
            { name: "Create a call task" },
          ),
        ],
        [
          action(
            "friendly_nudge",
            "invoices",
            "send_reminder",
            { number: "{{trigger.number}}", tone: "Friendly" },
            { name: "Send a friendly reminder" },
          ),
          action(
            "log_reminder",
            "sheet",
            "append_row",
            {
              sheet: "Payments log",
              values:
                "{{trigger.number}}, {{trigger.client_name}}, friendly reminder, {{run.now | date}}",
            },
            { name: "Log the reminder" },
          ),
        ],
      ),
    ],
    related: [
      "review-requests",
      "failed-payment-recovery",
      "retainer-budget-watch",
    ],
  },
  {
    slug: "instant-lead-response",
    title: "Answer new leads in under a minute",
    industry: "service",
    summary:
      "Every quote request lands in your CRM, big jobs get a text right away, the rest get a booking link.",
    problem:
      "Leads that wait an hour for a reply call the next company on the list. Most small teams answer the next morning.",
    outcome:
      "Each lead is logged and answered within a minute, and high-value jobs are flagged to sales.",
    manualMinutes: 8,
    monthlyVolume: 60,
    trigger: {
      app: "forms",
      event: "submitted",
      config: { form: "Quote request" },
    },
    steps: [
      action(
        "add_lead",
        "crm",
        "create_lead",
        {
          name: "{{trigger.name}}",
          email: "{{trigger.email}}",
          phone: "{{trigger.phone}}",
          source: "Website",
        },
        { name: "Add lead to CRM" },
      ),
      when(
        "big_job",
        "Budget over $1,500?",
        [["{{trigger.budget}}", "gt", "1500"]],
        [
          action(
            "text_back",
            "sms",
            "send",
            {
              to: "{{trigger.phone}}",
              message:
                "Hi {{trigger.name | first_word}}, thanks for asking about {{trigger.service | lower}}. {{steps.add_lead.owner | first_word}} will call you within the hour.",
            },
            { name: "Text the lead" },
          ),
          action(
            "ping_sales",
            "chat",
            "post",
            {
              channel: "#sales",
              text: "New {{trigger.budget | currency}} lead: {{trigger.name}}, {{trigger.service}}. Owner: {{steps.add_lead.owner}}.",
            },
            { name: "Flag it to sales" },
          ),
        ],
        [
          action(
            "send_booking_link",
            "email",
            "send",
            {
              to: "{{trigger.email}}",
              subject: "Your {{trigger.service | lower}} quote",
              body: "Hi {{trigger.name | first_word}}, thanks for reaching out. Pick a time for a free estimate here: https://book.example/estimate",
            },
            { name: "Email a booking link" },
          ),
        ],
      ),
    ],
    related: ["appointment-reminders", "review-requests", "support-escalation"],
  },
  {
    slug: "appointment-reminders",
    title: "Cut no-shows with appointment reminders",
    industry: "service",
    summary:
      "Text a reminder the day before, check who confirmed, and call the ones who did not.",
    problem:
      "A missed appointment costs a technician's morning. Reminders are sent by hand, if at all.",
    outcome:
      "Every booking gets a reminder 24 hours ahead, and unconfirmed ones turn into a call task.",
    manualMinutes: 6,
    monthlyVolume: 120,
    trigger: { app: "calendar", event: "booked", config: {} },
    steps: [
      waitUntil("day_before", "{{trigger.starts_at | subtract_hours:24}}"),
      action(
        "remind",
        "sms",
        "send",
        {
          to: "{{trigger.customer_phone}}",
          message:
            "Reminder: your {{trigger.service}} is tomorrow at {{trigger.starts_at | time}}. Reply C to confirm or R to reschedule.",
        },
        { name: "Text a reminder" },
      ),
      wait("give_time", 20, "hours"),
      action(
        "confirmed",
        "calendar",
        "check_confirmation",
        { customer: "{{trigger.customer_name}}" },
        { name: "Check confirmation" },
      ),
      when(
        "not_confirmed",
        "Still not confirmed?",
        [["{{steps.confirmed.confirmed}}", "equals", "false"]],
        [
          action(
            "call_customer",
            "tasks",
            "create",
            {
              title:
                "Call {{trigger.customer_name}} to confirm {{trigger.service}}",
              assignee: "Front desk",
              due_in_days: "0",
            },
            { name: "Create a call task" },
          ),
        ],
      ),
    ],
    related: [
      "instant-lead-response",
      "review-requests",
      "chase-unpaid-invoices",
    ],
  },
  {
    slug: "review-requests",
    title: "Ask for reviews after paid jobs",
    industry: "service",
    summary:
      "Two days after an invoice is paid, text the client a review link and log it.",
    problem:
      "Happy clients would leave a review if someone asked at the right moment. Nobody remembers to ask.",
    outcome:
      "Every paid job gets one polite review request, with a log to see what went out.",
    manualMinutes: 4,
    monthlyVolume: 70,
    trigger: { app: "invoices", event: "paid", config: {} },
    steps: [
      wait("settle_in", 2, "days"),
      only("has_phone", "Only clients with a phone number", [
        ["{{trigger.client_phone}}", "is_not_empty"],
      ]),
      set("compose", "Write the request", [
        ["first_name", "{{trigger.client_name | first_word}}"],
        ["review_link", "https://reviews.example/r/{{trigger.number | lower}}"],
      ]),
      action(
        "ask",
        "sms",
        "send",
        {
          to: "{{trigger.client_phone}}",
          message:
            "Hi {{steps.compose.first_name}}, thanks for your business. Would you leave us a quick review? {{steps.compose.review_link}}",
        },
        { name: "Text the review link" },
      ),
      action(
        "log_request",
        "sheet",
        "append_row",
        {
          sheet: "Leads log",
          values: "Review request, {{trigger.client_name}}, {{run.now | date}}",
        },
        { name: "Log the request" },
      ),
    ],
    related: [
      "chase-unpaid-invoices",
      "appointment-reminders",
      "instant-lead-response",
    ],
  },
];
