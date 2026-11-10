import type { AppDefinition } from "@/lib/engine/types";
import { contactOutputs, input, invoiceOutputs, out } from "./app-fields";

export const businessApps: AppDefinition[] = [
  {
    id: "crm",
    name: "CRM",
    category: "Sales",
    description: "Contacts, leads and deals.",
    icon: "users",
    ratePerMinute: 120,
    events: [
      {
        id: "deal_won",
        label: "Deal won",
        description: "A deal moves to Won.",
        config: [],
        outputs: [
          out("deal_name", "Deal", "text", "Fernwood Bakery website retainer"),
          out("client_name", "Client", "text", "Fernwood Bakery"),
          out(
            "contact_email",
            "Contact email",
            "text",
            "hello@fernwoodbakery.example",
          ),
          out("value", "Deal value", "number", 12000),
          out("owner", "Account manager", "text", "Jordan Reyes"),
        ],
      },
      {
        id: "trial_started",
        label: "Trial started",
        description: "A new account starts a free trial.",
        config: [],
        outputs: [
          out("account", "Account", "text", "Northwind Logistics"),
          out("email", "Email", "text", "ops@northwind.example"),
          out("seats", "Seats", "number", 8),
          out("activated", "Activated", "boolean", false),
          out("started_at", "Started at", "date", "2026-11-02T10:00:00Z"),
        ],
      },
    ],
    operations: [
      {
        id: "create_lead",
        label: "Create lead",
        kind: "write",
        fields: [
          input("name", "Name"),
          input("email", "Email", "email", false),
          input("phone", "Phone", "phone", false),
          input("source", "Source", "select", true, [
            "Website",
            "Phone",
            "Referral",
            "Ads",
          ]),
        ],
        outputs: [
          out("id", "Lead ID", "text", "ld_7731"),
          out("owner", "Assigned to", "text", "Jordan Reyes"),
        ],
      },
      {
        id: "find_contact",
        label: "Find contact",
        kind: "read",
        fields: [input("email", "Email", "email")],
        outputs: contactOutputs,
      },
      {
        id: "update_contact",
        label: "Update contact",
        kind: "write",
        fields: [
          input("id", "Contact ID"),
          input("field", "Field"),
          input("value", "New value"),
        ],
        outputs: [out("updated", "Updated", "boolean", true)],
      },
      {
        id: "get_account",
        label: "Get account usage",
        kind: "read",
        fields: [input("account", "Account")],
        outputs: [
          out("activated", "Activated", "boolean", true),
          out("active_users", "Active users", "number", 5),
          out("converted", "Converted to paid", "boolean", false),
        ],
      },
    ],
  },
  {
    id: "invoices",
    name: "Invoices",
    category: "Finance",
    description: "Invoices, payments and reminders.",
    icon: "invoice",
    ratePerMinute: 60,
    events: [
      {
        id: "overdue",
        label: "Invoice overdue",
        description: "Checks daily for invoices past their due date.",
        config: [],
        outputs: [
          ...invoiceOutputs,
          out("days_overdue", "Days overdue", "number", 34),
          out("reminders_sent", "Reminders sent", "number", 1),
        ],
      },
      {
        id: "paid",
        label: "Invoice paid",
        description: "A client pays an invoice.",
        config: [],
        outputs: [
          ...invoiceOutputs,
          out("paid_at", "Paid at", "date", "2026-11-08T11:20:00Z"),
        ],
      },
      {
        id: "payment_failed",
        label: "Card payment failed",
        description: "A subscription charge is declined.",
        config: [],
        outputs: [
          out("customer", "Customer", "text", "Lumen Analytics"),
          out("email", "Email", "text", "finance@lumen.example"),
          out("amount", "Amount", "number", 249),
          out("plan", "Plan", "text", "Team"),
          out("attempt", "Attempt", "number", 1),
        ],
      },
    ],
    operations: [
      {
        id: "send_reminder",
        label: "Send payment reminder",
        kind: "write",
        fields: [
          input("number", "Invoice number"),
          input("tone", "Tone", "select", true, ["Friendly", "Firm", "Final"]),
        ],
        outputs: [
          out("sent", "Sent", "boolean", true),
          out("paid_after", "Paid after reminder", "boolean", false),
        ],
      },
      {
        id: "retry_charge",
        label: "Retry card charge",
        kind: "write",
        fields: [input("customer", "Customer")],
        outputs: [out("succeeded", "Succeeded", "boolean", false)],
      },
    ],
  },
  {
    id: "calendar",
    name: "Calendar",
    category: "Scheduling",
    description: "Bookings and meetings.",
    icon: "calendar",
    ratePerMinute: 120,
    events: [
      {
        id: "booked",
        label: "Appointment booked",
        description: "A customer books a time.",
        config: [],
        outputs: [
          out("customer_name", "Customer", "text", "Luis Hernandez"),
          out("customer_phone", "Customer phone", "text", "(303) 555-0109"),
          out("customer_email", "Customer email", "text", "luis.h@example.com"),
          out("service", "Service", "text", "AC tune-up"),
          out("starts_at", "Starts at", "date", "2026-11-12T15:00:00Z"),
        ],
      },
    ],
    operations: [
      {
        id: "create_event",
        label: "Create event",
        kind: "write",
        fields: [
          input("title", "Title"),
          input("attendee", "Attendee email", "email"),
          input("starts_at", "Starts at", "date"),
        ],
        outputs: [
          out("event_id", "Event ID", "text", "ev_5520"),
          out("starts_at", "Starts at", "date", "2026-11-12T16:00:00Z"),
          out("link", "Meeting link", "text", "https://meet.example/k2d-88a"),
        ],
      },
      {
        id: "check_confirmation",
        label: "Check confirmation",
        kind: "read",
        fields: [input("customer", "Customer")],
        outputs: [out("confirmed", "Confirmed", "boolean", true)],
      },
    ],
  },
  {
    id: "chat",
    name: "Team chat",
    category: "Team",
    description: "Post updates to your team channels.",
    icon: "chat",
    ratePerMinute: 60,
    events: [],
    operations: [
      {
        id: "post",
        label: "Post message",
        kind: "write",
        fields: [
          input("channel", "Channel", "select", true, [
            "#sales",
            "#billing",
            "#ops",
            "#support",
            "#clients",
          ]),
          input("text", "Message", "longtext"),
        ],
        outputs: [out("posted", "Posted", "boolean", true)],
      },
    ],
  },
  {
    id: "sheet",
    name: "Spreadsheet",
    category: "Data",
    description: "Read and write rows in a shared spreadsheet.",
    icon: "table",
    ratePerMinute: 60,
    events: [],
    operations: [
      {
        id: "read_rows",
        label: "Read rows",
        kind: "read",
        fields: [
          input("sheet", "Sheet", "select", true, [
            "Clients",
            "Accounts",
            "Onboarding checklist",
          ]),
        ],
        outputs: [
          out("rows", "Rows", "list", [
            {
              name: "Fernwood Bakery",
              email: "hello@fernwoodbakery.example",
              hours: 31,
            },
          ]),
          out("count", "Row count", "number", 6),
        ],
      },
      {
        id: "append_row",
        label: "Add row",
        kind: "write",
        fields: [
          input("sheet", "Sheet", "select", true, [
            "Leads log",
            "Payments log",
          ]),
          input("values", "Values", "longtext"),
        ],
        outputs: [out("row", "Row number", "number", 214)],
      },
    ],
  },
  {
    id: "tasks",
    name: "Tasks",
    category: "Team",
    description: "Create tasks for your team.",
    icon: "check",
    ratePerMinute: 120,
    events: [],
    operations: [
      {
        id: "create",
        label: "Create task",
        kind: "write",
        fields: [
          input("title", "Title"),
          input("assignee", "Assignee"),
          input("due_in_days", "Due in, days", "number", false),
        ],
        outputs: [out("task_id", "Task ID", "text", "tk_2290")],
      },
    ],
  },
];
