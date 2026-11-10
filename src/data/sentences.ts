export type Sentence = {
  slug: string;
  phrase: string;
  unit: string;
  minutes: number;
  count: number;
};

export const sentences: Sentence[] = [
  {
    slug: "chase-unpaid-invoices",
    phrase: "chase unpaid invoices",
    unit: "invoices",
    minutes: 12,
    count: 6,
  },
  {
    slug: "instant-lead-response",
    phrase: "reply to new leads",
    unit: "leads",
    minutes: 8,
    count: 15,
  },
  {
    slug: "appointment-reminders",
    phrase: "remind customers about bookings",
    unit: "bookings",
    minutes: 6,
    count: 30,
  },
  {
    slug: "review-requests",
    phrase: "ask happy clients for reviews",
    unit: "clients",
    minutes: 4,
    count: 15,
  },
  {
    slug: "client-onboarding",
    phrase: "onboard new clients",
    unit: "clients",
    minutes: 45,
    count: 1,
  },
  {
    slug: "monthly-client-report",
    phrase: "send client reports",
    unit: "clients",
    minutes: 15,
    count: 8,
  },
  {
    slug: "content-brief-intake",
    phrase: "turn client briefs into tasks",
    unit: "briefs",
    minutes: 15,
    count: 5,
  },
  {
    slug: "retainer-budget-watch",
    phrase: "check retainer hours",
    unit: "clients",
    minutes: 10,
    count: 8,
  },
  {
    slug: "trial-nurture",
    phrase: "follow up with trial signups",
    unit: "trials",
    minutes: 15,
    count: 10,
  },
  {
    slug: "failed-payment-recovery",
    phrase: "chase failed card payments",
    unit: "payments",
    minutes: 10,
    count: 4,
  },
  {
    slug: "churn-risk-alert",
    phrase: "check accounts for churn risk",
    unit: "accounts",
    minutes: 5,
    count: 40,
  },
  {
    slug: "support-escalation",
    phrase: "sort support tickets",
    unit: "tickets",
    minutes: 5,
    count: 35,
  },
];
