import type { DataRecord } from "@/lib/engine/types";

export const sheets: Record<string, DataRecord[]> = {
  Clients: [
    {
      name: "Fernwood Bakery",
      email: "hello@fernwoodbakery.example",
      hours: 31,
      highlight: "new holiday menu page",
    },
    {
      name: "Harbor Dental Group",
      email: "office@harbordental.example",
      hours: 24,
      highlight: "online booking went live",
    },
    {
      name: "Summit Roofing",
      email: "team@summitroofing.example",
      hours: 18,
      highlight: "storm season ads",
    },
    {
      name: "Atlas Fitness Studio",
      email: "frontdesk@atlasfit.example",
      hours: 12,
      highlight: "class schedule redesign",
    },
    {
      name: "Copperline Legal",
      email: "admin@copperline.example",
      hours: 27,
      highlight: "intake form rebuild",
    },
    {
      name: "Quarry Lane Coffee",
      email: "owner@quarrylane.example",
      hours: 9,
      highlight: "loyalty email series",
    },
  ],
  Accounts: [
    {
      account_id: "ac_1102",
      name: "Northwind Logistics",
      owner: "Sam Whitfield",
      usage_change_pct: -52,
      mrr: 900,
    },
    {
      account_id: "ac_1187",
      name: "Lumen Analytics",
      owner: "Alex Moreno",
      usage_change_pct: 8,
      mrr: 249,
    },
    {
      account_id: "ac_1203",
      name: "Mesa Solar Co",
      owner: "Taylor Brooks",
      usage_change_pct: -12,
      mrr: 499,
    },
    {
      account_id: "ac_1240",
      name: "Brightpath Tutoring",
      owner: "Sam Whitfield",
      usage_change_pct: -61,
      mrr: 149,
    },
    {
      account_id: "ac_1266",
      name: "Tidewater Marine Supply",
      owner: "Alex Moreno",
      usage_change_pct: 23,
      mrr: 699,
    },
    {
      account_id: "ac_1291",
      name: "Riverbend Vet Clinic",
      owner: "Taylor Brooks",
      usage_change_pct: -44,
      mrr: 249,
    },
  ],
  "Onboarding checklist": [
    { task: "Create shared drive folder", owner: "Ops", due_in_days: 1 },
    { task: "Collect brand assets", owner: "Design", due_in_days: 2 },
    { task: "Set up analytics access", owner: "Ops", due_in_days: 2 },
    { task: "Draft 90-day plan", owner: "Account manager", due_in_days: 5 },
    {
      task: "Schedule first monthly review",
      owner: "Account manager",
      due_in_days: 7,
    },
  ],
};
