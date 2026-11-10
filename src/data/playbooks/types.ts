import type { Step, Trigger } from "@/lib/engine/types";

export type Industry = "service" | "agency" | "saas";

export type Playbook = {
  slug: string;
  title: string;
  industry: Industry;
  summary: string;
  problem: string;
  outcome: string;
  manualMinutes: number;
  monthlyVolume: number;
  trigger: Trigger;
  steps: Step[];
  related: string[];
};

export const industries: { id: Industry; label: string; short: string }[] = [
  { id: "service", label: "Service businesses", short: "Service" },
  { id: "agency", label: "Agencies", short: "Agency" },
  { id: "saas", label: "SaaS teams", short: "SaaS" },
];
