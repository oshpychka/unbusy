import { action, branch, each, wait } from "@/lib/engine/build";
import type { Playbook } from "./types";

export const agencyPlaybooks: Playbook[] = [
  {
    slug: "client-onboarding",
    title: "Onboard new clients the same day",
    industry: "agency",
    summary:
      "When a deal is won, book the kickoff, send the welcome email and create the setup checklist.",
    problem:
      "The first week with a new client depends on who remembers which steps. Things slip and the kickoff moves twice.",
    outcome:
      "A kickoff on the calendar, a welcome email with the link, and a task for every setup step, all within a minute.",
    manualMinutes: 45,
    monthlyVolume: 4,
    trigger: { app: "crm", event: "deal_won", config: {} },
    steps: [
      action(
        "kickoff",
        "calendar",
        "create_event",
        {
          title: "Kickoff: {{trigger.client_name}}",
          attendee: "{{trigger.contact_email}}",
          starts_at: "{{run.now | add_days:3}}",
        },
        { name: "Book the kickoff call" },
      ),
      action(
        "welcome",
        "email",
        "send",
        {
          to: "{{trigger.contact_email}}",
          subject: "Welcome aboard, {{trigger.client_name}}",
          body: "We are glad to start. Your kickoff is on {{steps.kickoff.starts_at | date}}, join here: {{steps.kickoff.link}}. {{trigger.owner}} will be your main contact.",
        },
        { name: "Send the welcome email" },
      ),
      action(
        "checklist",
        "sheet",
        "read_rows",
        { sheet: "Onboarding checklist" },
        { name: "Read the setup checklist" },
      ),
      each(
        "setup_tasks",
        "For each checklist item",
        "{{steps.checklist.rows}}",
        [
          action(
            "setup_task",
            "tasks",
            "create",
            {
              title: "{{item.task}} for {{trigger.client_name}}",
              assignee: "{{item.owner}}",
              due_in_days: "{{item.due_in_days}}",
            },
            { name: "Create a setup task" },
          ),
        ],
      ),
      action(
        "announce",
        "chat",
        "post",
        {
          channel: "#clients",
          text: "New client: {{trigger.client_name}} ({{trigger.value | currency}}). Kickoff booked, {{steps.checklist.count}} setup tasks created.",
        },
        { name: "Announce to the team" },
      ),
    ],
    related: [
      "monthly-client-report",
      "retainer-budget-watch",
      "content-brief-intake",
    ],
  },
  {
    slug: "monthly-client-report",
    title: "Send monthly client reports",
    industry: "agency",
    summary:
      "On the first of the month, read the client list and email each client their hours and highlights.",
    problem:
      "Report day eats a full afternoon of copying numbers from a spreadsheet into emails.",
    outcome:
      "Every client gets the same clear summary on the same morning, and the team sees when it is done.",
    manualMinutes: 90,
    monthlyVolume: 1,
    trigger: {
      app: "schedule",
      event: "tick",
      config: { rule: "monthly on day 1 at 09:00" },
    },
    steps: [
      action(
        "clients",
        "sheet",
        "read_rows",
        { sheet: "Clients" },
        { name: "Read the client list" },
      ),
      each("per_client", "For each client", "{{steps.clients.rows}}", [
        action(
          "report_email",
          "email",
          "send",
          {
            to: "{{item.email}}",
            subject:
              "{{item.name}}: your {{trigger.period_end | month}} report",
            body: "This month we spent {{item.hours}} hours on your account. Highlights: {{item.highlight}}. Reply to this email with any questions.",
          },
          { name: "Email the report" },
        ),
      ]),
      action(
        "reports_done",
        "chat",
        "post",
        {
          channel: "#clients",
          text: "Monthly reports sent to {{steps.clients.count}} clients.",
        },
        { name: "Tell the team" },
      ),
    ],
    related: ["retainer-budget-watch", "client-onboarding", "churn-risk-alert"],
  },
  {
    slug: "content-brief-intake",
    title: "Turn content briefs into tasks",
    industry: "agency",
    summary:
      "A brief from the client becomes a writer task, a confirmation email and a follow-up if nothing moves.",
    problem:
      "Briefs arrive by email, sit in someone's inbox and the client asks for an update a week later.",
    outcome:
      "Each brief is confirmed to the client in a minute and checked again three days later.",
    manualMinutes: 15,
    monthlyVolume: 20,
    trigger: {
      app: "forms",
      event: "submitted",
      config: { form: "Content brief" },
    },
    steps: [
      action(
        "writer_task",
        "tasks",
        "create",
        {
          title: "Draft: {{trigger.service}} for {{trigger.name}}",
          assignee: "Content team",
          due_in_days: "3",
        },
        { name: "Create a writer task" },
      ),
      action(
        "confirm",
        "email",
        "send",
        {
          to: "{{trigger.email}}",
          subject: "We got your brief",
          body: "Thanks {{trigger.name | first_word}}. Your brief for {{trigger.service | lower}} is with our writers. Expect a first draft within three business days.",
        },
        { name: "Confirm to the client" },
      ),
      wait("three_days", 3, "days"),
      action(
        "check_in",
        "chat",
        "post",
        {
          channel: "#ops",
          text: "Check on task {{steps.writer_task.task_id}}: draft for {{trigger.name}} is due today.",
        },
        { name: "Remind the team" },
      ),
    ],
    related: [
      "client-onboarding",
      "monthly-client-report",
      "instant-lead-response",
    ],
  },
  {
    slug: "retainer-budget-watch",
    title: "Keep retainers within budget",
    industry: "agency",
    summary:
      "Watch hours used against each retainer and warn the account manager before the client is over.",
    problem:
      "Teams find out a retainer ran over when the invoice is already awkward to send.",
    outcome:
      "A heads-up at 80%, a client conversation at 95%, and a forecast for the month end.",
    manualMinutes: 10,
    monthlyVolume: 8,
    trigger: {
      app: "monitor",
      event: "threshold",
      config: {
        metric: "Retainer hours",
        limit: "40",
        warn_pct: "80",
        alert_pct: "95",
      },
    },
    steps: [
      branch("by_state", "How close to the limit?", "{{trigger.state}}", [
        [
          "Warning",
          "yellow",
          [
            action(
              "warn_manager",
              "email",
              "send",
              {
                to: "am@unbusy-demo.example",
                subject:
                  "{{trigger.client}} is at {{trigger.used_pct}}% of its retainer",
                body: "{{trigger.used}} of {{trigger.limit}} hours used. At this pace the month ends near {{trigger.forecast}} hours.",
              },
              { name: "Warn the account manager" },
            ),
          ],
        ],
        [
          "Alert",
          "red",
          [
            action(
              "alert_channel",
              "chat",
              "post",
              {
                channel: "#clients",
                text: "{{trigger.client}} hit {{trigger.used_pct}}% of its retainer. Forecast: {{trigger.forecast}} of {{trigger.limit}} hours.",
              },
              { name: "Alert the client channel" },
            ),
            action(
              "talk_task",
              "tasks",
              "create",
              {
                title: "Talk to {{trigger.client}} about extra hours",
                assignee: "Account manager",
                due_in_days: "1",
              },
              { name: "Plan the client conversation" },
            ),
          ],
        ],
      ]),
    ],
    related: ["monthly-client-report", "client-onboarding", "churn-risk-alert"],
  },
];
