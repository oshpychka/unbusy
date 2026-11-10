import { action, branch, each, only, wait, when } from "@/lib/engine/build";
import type { Playbook } from "./types";

export const saasPlaybooks: Playbook[] = [
  {
    slug: "trial-nurture",
    title: "Guide trials to activation",
    industry: "saas",
    summary:
      "Check each trial after three days, send tips or offer help, and flag the ones that stall.",
    problem:
      "Most trials go quiet in the first week. The team only notices when the trial has already expired.",
    outcome:
      "Every trial gets the right message for how far it got, and stalled ones reach a person before day ten.",
    manualMinutes: 15,
    monthlyVolume: 40,
    trigger: { app: "crm", event: "trial_started", config: {} },
    steps: [
      wait("first_days", 3, "days"),
      action(
        "usage",
        "crm",
        "get_account",
        { account: "{{trigger.account}}" },
        { name: "Check account usage" },
      ),
      when(
        "activated",
        "Activated already?",
        [["{{steps.usage.activated}}", "equals", "true"]],
        [
          action(
            "tips",
            "email",
            "send",
            {
              to: "{{trigger.email}}",
              subject: "Three things teams set up next",
              body: "Nice start. Teams of {{trigger.seats}} usually add reports and alerts next.",
            },
            { name: "Send next-step tips" },
          ),
        ],
        [
          action(
            "offer_help",
            "email",
            "send",
            {
              to: "{{trigger.email}}",
              subject: "Want a hand getting set up?",
              body: "Book 20 minutes with us and we will set up your first workflow together.",
            },
            { name: "Offer a setup call" },
          ),
        ],
      ),
      wait("one_week", 7, "days"),
      action(
        "usage_later",
        "crm",
        "get_account",
        { account: "{{trigger.account}}" },
        { name: "Check usage again" },
      ),
      only("not_paid", "Only trials that have not converted", [
        ["{{steps.usage_later.converted}}", "equals", "false"],
      ]),
      action(
        "sales_call",
        "tasks",
        "create",
        {
          title: "Call {{trigger.account}} before the trial ends",
          assignee: "Customer success",
          due_in_days: "2",
        },
        { name: "Create a call task" },
      ),
    ],
    related: [
      "failed-payment-recovery",
      "churn-risk-alert",
      "support-escalation",
    ],
  },
  {
    slug: "failed-payment-recovery",
    title: "Recover failed card payments",
    industry: "saas",
    summary:
      "Retry the charge, ask the customer to update their card, and escalate if the second try fails.",
    problem:
      "Declined cards quietly turn into churn. Nobody owns the follow-up.",
    outcome:
      "A retry right away, a polite card update email, a second retry and a task if money is still missing.",
    manualMinutes: 10,
    monthlyVolume: 15,
    trigger: { app: "invoices", event: "payment_failed", config: {} },
    steps: [
      action(
        "first_retry",
        "invoices",
        "retry_charge",
        { customer: "{{trigger.customer}}" },
        { name: "Retry the charge", retry: { attempts: 2, backoffMs: 30000 } },
      ),
      only("still_failing", "Only if the retry failed", [
        ["{{steps.first_retry.succeeded}}", "equals", "false"],
      ]),
      action(
        "update_card",
        "email",
        "send",
        {
          to: "{{trigger.email}}",
          subject: "Your {{trigger.plan}} payment did not go through",
          body: "We could not charge {{trigger.amount | currency}} for your {{trigger.plan}} plan. Update your card here: https://billing.example/update",
        },
        { name: "Ask for a new card" },
      ),
      wait("give_days", 3, "days"),
      action(
        "second_retry",
        "invoices",
        "retry_charge",
        { customer: "{{trigger.customer}}" },
        { name: "Retry again" },
      ),
      when(
        "recovered",
        "Payment recovered?",
        [["{{steps.second_retry.succeeded}}", "equals", "true"]],
        [
          action(
            "cheer",
            "chat",
            "post",
            {
              channel: "#billing",
              text: "Recovered {{trigger.amount | currency}} from {{trigger.customer}}.",
            },
            { name: "Share the win" },
          ),
        ],
        [
          action(
            "escalate",
            "tasks",
            "create",
            {
              title: "Reach out to {{trigger.customer}} about a failed payment",
              assignee: "Billing",
              due_in_days: "1",
            },
            { name: "Escalate to billing" },
          ),
        ],
      ),
    ],
    related: ["chase-unpaid-invoices", "trial-nurture", "churn-risk-alert"],
  },
  {
    slug: "churn-risk-alert",
    title: "Spot accounts at risk of churning",
    industry: "saas",
    summary:
      "Every Monday, check usage for each account and alert the owner when it drops sharply.",
    problem:
      "Usage drops weeks before a cancellation, but nobody looks at the numbers until the email arrives.",
    outcome:
      "Owners hear about a 40% drop the same week and have time to reach out.",
    manualMinutes: 30,
    monthlyVolume: 4,
    trigger: {
      app: "schedule",
      event: "tick",
      config: { rule: "weekly on monday at 08:00" },
    },
    steps: [
      action(
        "accounts",
        "sheet",
        "read_rows",
        { sheet: "Accounts" },
        { name: "Read account usage" },
      ),
      each("per_account", "For each account", "{{steps.accounts.rows}}", [
        when(
          "dropped",
          "Usage down more than 40%?",
          [["{{item.usage_change_pct}}", "lt", "-40"]],
          [
            action(
              "tag_risk",
              "crm",
              "update_contact",
              { id: "{{item.account_id}}", field: "health", value: "At risk" },
              { name: "Mark as at risk" },
            ),
            action(
              "tell_owner",
              "chat",
              "post",
              {
                channel: "#support",
                text: "{{item.name}} usage fell {{item.usage_change_pct}}% this week ({{item.mrr | currency}}/mo). Owner: {{item.owner}}.",
              },
              { name: "Alert the owner" },
            ),
          ],
        ),
      ]),
    ],
    related: ["trial-nurture", "support-escalation", "failed-payment-recovery"],
  },
  {
    slug: "support-escalation",
    title: "Route support tickets by priority",
    industry: "saas",
    summary:
      "Page the on-call person for urgent tickets, post high ones to the team, queue the rest.",
    problem:
      "Urgent tickets wait in the same queue as password resets until someone happens to look.",
    outcome:
      "Urgent issues reach a phone in seconds, and the rest are sorted before anyone opens the inbox.",
    manualMinutes: 5,
    monthlyVolume: 150,
    trigger: { app: "webhook", event: "ticket_created", config: {} },
    steps: [
      branch(
        "by_priority",
        "Ticket priority",
        "{{trigger.priority}}",
        [
          [
            "Urgent",
            "urgent",
            [
              action(
                "page_oncall",
                "sms",
                "send",
                {
                  to: "(512) 555-0100",
                  message:
                    "URGENT {{trigger.ticket_id}}: {{trigger.subject}} ({{trigger.plan}})",
                },
                { name: "Text the on-call engineer" },
              ),
              action(
                "urgent_post",
                "chat",
                "post",
                {
                  channel: "#support",
                  text: "Urgent {{trigger.ticket_id}} from {{trigger.customer_email}}: {{trigger.subject}}",
                },
                { name: "Post to support" },
              ),
            ],
          ],
          [
            "High",
            "high",
            [
              action(
                "high_post",
                "chat",
                "post",
                {
                  channel: "#support",
                  text: "High priority {{trigger.ticket_id}}: {{trigger.subject}}",
                },
                { name: "Post to support" },
              ),
            ],
          ],
        ],
        [
          action(
            "queue_task",
            "tasks",
            "create",
            {
              title: "Reply to {{trigger.ticket_id}}: {{trigger.subject}}",
              assignee: "Support",
              due_in_days: "1",
            },
            { name: "Queue for support" },
          ),
        ],
      ),
    ],
    related: ["churn-risk-alert", "instant-lead-response", "trial-nurture"],
  },
];
