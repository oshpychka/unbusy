import {
  areaCodes,
  companies,
  firstNames,
  lastNames,
  owners,
  services,
} from "@/data/people";
import { between, createRandom, pick, type Random } from "./random";
import { evaluateThreshold } from "./threshold";
import type { DataRecord, Trigger } from "./types";

const dayMs = 86_400_000;

function person(random: Random) {
  const first = pick(random, firstNames);
  const last = pick(random, lastNames);
  return {
    name: `${first} ${last}`,
    email: `${first}.${last}@example.com`.toLowerCase(),
    phone: `(${pick(random, areaCodes)}) 555-01${between(random, 10, 99)}`,
  };
}

function company(random: Random) {
  const name = pick(random, companies);
  const domain = name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z]+/g, "");
  return { name, email: `billing@${domain}.example` };
}

function iso(time: number) {
  return new Date(time).toISOString();
}

function day(time: number) {
  return iso(time).slice(0, 10);
}

const tickets = [
  "Exports fail for large accounts",
  "Cannot invite a teammate",
  "Billing page shows the wrong plan",
  "Webhook deliveries delayed",
  "Password reset email not arriving",
  "Dashboard loads slowly",
];

type Generator = (
  random: Random,
  now: number,
  config: Record<string, string>,
) => DataRecord;

const generators: Record<string, Generator> = {
  "forms.submitted": (random, now) => {
    const lead = person(random);
    return {
      ...lead,
      service: pick(random, services),
      zip: String(between(random, 78701, 78759)),
      budget: between(random, 3, 60) * 100,
      message: "Looking for a quote, flexible on timing.",
      submitted_at: iso(now),
    };
  },
  "webhook.call_missed": (random, now) => {
    const caller = person(random);
    return {
      caller_phone: caller.phone,
      caller_name: caller.name,
      called_at: iso(now),
    };
  },
  "webhook.ticket_created": (random) => {
    const roll = random();
    const customer = company(random);
    return {
      ticket_id: `T-${between(random, 30000, 39999)}`,
      subject: pick(random, tickets),
      priority: roll < 0.12 ? "urgent" : roll < 0.38 ? "high" : "normal",
      customer_email: customer.email.replace("billing", "ops"),
      plan: pick(random, ["Starter", "Team", "Business"]),
      mrr: pick(random, [49, 149, 249, 499, 900]),
    };
  },
  "schedule.tick": (_random, now) => {
    const date = new Date(now);
    const start = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1);
    const end = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0);
    return { run_at: iso(now), period_start: day(start), period_end: day(end) };
  },
  "monitor.threshold": (random, _now, config) => {
    const limit = Number(config.limit) || 40;
    const warnPct = Number(config.warn_pct) || 80;
    const alertPct = Number(config.alert_pct) || 95;
    const used = Math.round(limit * (0.78 + random() * 0.3));
    const elapsedDays = between(random, 20, 29);
    const result = evaluateThreshold({
      used,
      limit,
      warnPct,
      alertPct,
      elapsedDays,
      periodDays: 30,
    });
    return {
      metric: config.metric || "Retainer hours",
      client: pick(random, companies),
      used,
      limit,
      used_pct: result.usedPct,
      state: result.state,
      forecast: result.forecast,
    };
  },
  "crm.deal_won": (random) => {
    const client = company(random);
    return {
      deal_name: `${client.name} website retainer`,
      client_name: client.name,
      contact_email: client.email.replace("billing", "hello"),
      value: between(random, 4, 30) * 1000,
      owner: pick(random, owners),
    };
  },
  "crm.trial_started": (random, now) => {
    const account = company(random);
    return {
      account: account.name,
      email: account.email.replace("billing", "ops"),
      seats: between(random, 2, 25),
      activated: false,
      started_at: iso(now),
    };
  },
  "invoices.overdue": (random, now) => {
    const client = company(random);
    const daysOverdue = between(random, 3, 62);
    return {
      number: `INV-${between(random, 1000, 1999)}`,
      client_name: client.name,
      client_email: client.email,
      client_phone: `(${pick(random, areaCodes)}) 555-01${between(random, 10, 99)}`,
      amount: between(random, 4, 40) * 50,
      due_date: day(now - daysOverdue * dayMs),
      days_overdue: daysOverdue,
      reminders_sent: between(random, 0, 2),
    };
  },
  "invoices.paid": (random, now) => {
    const client = company(random);
    return {
      number: `INV-${between(random, 1000, 1999)}`,
      client_name: client.name,
      client_email: client.email,
      client_phone:
        random() < 0.15
          ? ""
          : `(${pick(random, areaCodes)}) 555-01${between(random, 10, 99)}`,
      amount: between(random, 4, 40) * 50,
      due_date: day(now - between(random, 0, 20) * dayMs),
      paid_at: iso(now),
    };
  },
  "invoices.payment_failed": (random) => {
    const customer = company(random);
    return {
      customer: customer.name,
      email: customer.email.replace("billing", "finance"),
      amount: pick(random, [49, 149, 249, 499, 999]),
      plan: pick(random, ["Starter", "Team", "Business"]),
      attempt: 1,
    };
  },
  "calendar.booked": (random, now) => {
    const customer = person(random);
    const startDay = Math.floor(now / dayMs) + between(random, 2, 6);
    return {
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      service: pick(random, services),
      starts_at: iso(startDay * dayMs + between(random, 14, 22) * 3_600_000),
    };
  },
};

export function samplePayload(
  trigger: Trigger,
  seed: number,
  now: number,
): DataRecord {
  const generator = generators[`${trigger.app}.${trigger.event}`];
  if (!generator)
    throw new Error(`No sample generator for ${trigger.app}.${trigger.event}`);
  return generator(createRandom(seed), now, trigger.config);
}

export function samplePayloads(
  trigger: Trigger,
  count: number,
  seed: number,
  now: number,
) {
  return Array.from({ length: count }, (_, index) =>
    samplePayload(trigger, seed + index * 7919, now),
  );
}
