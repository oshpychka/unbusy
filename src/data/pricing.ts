export type Plan = {
  id: string;
  name: string;
  monthly: number;
  audience: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    monthly: 19,
    audience: "One person running the back office.",
    features: [
      "5 active workflows",
      "1,000 runs a month",
      "30 days of run history",
      "Email support",
    ],
  },
  {
    id: "team",
    name: "Team",
    monthly: 49,
    audience: "Small teams that want fewer manual handoffs.",
    features: [
      "25 active workflows",
      "10,000 runs a month",
      "90 days of run history",
      "Batch what-if runs",
      "5 team members",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    monthly: 129,
    audience: "Agencies running automations for clients.",
    features: [
      "Unlimited workflows",
      "50,000 runs a month",
      "1 year of run history",
      "10 client workspaces",
      "Priority support",
    ],
  },
];

export const comparison: { label: string; values: [string, string, string] }[] =
  [
    { label: "Active workflows", values: ["5", "25", "Unlimited"] },
    { label: "Runs a month", values: ["1,000", "10,000", "50,000"] },
    { label: "Run history", values: ["30 days", "90 days", "1 year"] },
    { label: "Step-by-step run debugger", values: ["Yes", "Yes", "Yes"] },
    { label: "Batch what-if runs", values: ["No", "Yes", "Yes"] },
    { label: "Retries and fallback paths", values: ["Yes", "Yes", "Yes"] },
    { label: "Team members", values: ["1", "5", "20"] },
    { label: "Client workspaces", values: ["No", "No", "10"] },
  ];

export const faqs = [
  {
    question: "What counts as a run?",
    answer:
      "One run is one trigger event going through a workflow, however many steps it has. A loop over 20 clients is still one run.",
  },
  {
    question: "What happens if I go over my run limit?",
    answer:
      "Workflows keep running for the rest of the month and we email you. If it happens two months in a row, we suggest the next plan.",
  },
  {
    question: "Can I test a workflow without sending anything?",
    answer:
      "Yes. Test runs use sample data and simulated apps, so no email, text or invoice goes out until you turn the workflow on.",
  },
  {
    question: "Do yearly plans cost less?",
    answer:
      "Yearly billing costs ten months instead of twelve. You can switch between monthly and yearly at any time.",
  },
  {
    question: "Is this demo connected to real apps?",
    answer:
      "No. This site is a demo. Everything runs in your browser on sample data and nothing leaves your device.",
  },
];
