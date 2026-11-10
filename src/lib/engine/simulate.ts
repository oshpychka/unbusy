import { sheets } from "@/data/sheets";
import { owners } from "@/data/people";
import type { Context } from "./expressions";
import { between, pick, type Random } from "./random";
import type { AppId, DataRecord, Json } from "./types";

export class SimulatedError extends Error {
  constructor(
    message: string,
    readonly transient: boolean,
  ) {
    super(message);
  }
}

export type SimulationResult = { output: DataRecord; recovered?: number };

type Handler = (
  input: Record<string, Json>,
  random: Random,
  context: Context,
) => SimulationResult;

const transientErrors = [
  "Timed out after 10s",
  "503 Service Unavailable",
  "Connection reset by peer",
];

function id(prefix: string, random: Random) {
  return `${prefix}_${Math.floor(random() * 36 ** 5)
    .toString(36)
    .padStart(5, "0")}`;
}

function amountOf(context: Context) {
  return Number(context.trigger.amount) || 0;
}

const phonePattern = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handlers: Record<string, Handler> = {
  "email.send": (input, random, context) => {
    if (!emailPattern.test(String(input.to ?? "")))
      throw new SimulatedError("Invalid recipient address", false);
    return {
      output: { message_id: id("msg", random), sent_at: context.run.now },
    };
  },
  "sms.send": (input, random) => {
    if (!phonePattern.test(String(input.to ?? "").trim()))
      throw new SimulatedError("Invalid phone number", false);
    return {
      output: {
        message_id: id("sms", random),
        segments: Math.max(
          1,
          Math.ceil(String(input.message ?? "").length / 160),
        ),
      },
    };
  },
  "crm.create_lead": (_input, random) => ({
    output: { id: id("ld", random), owner: pick(random, owners) },
  }),
  "crm.find_contact": (input, random) => {
    const email = String(input.email ?? "");
    if (!email) throw new SimulatedError("Contact not found", false);
    const name = email.split("@")[0]?.replace(/[._]/g, " ") ?? "";
    return {
      output: {
        id: id("ct", random),
        name,
        email,
        phone: `(512) 555-01${between(random, 10, 99)}`,
        owner: pick(random, owners),
        lifetime_value: between(random, 800, 24000),
      },
    };
  },
  "crm.update_contact": () => ({ output: { updated: true } }),
  "crm.get_account": (_input, random) => {
    const activated = random() < 0.6;
    return {
      output: {
        activated,
        active_users: activated
          ? between(random, 2, 12)
          : between(random, 0, 1),
        converted: activated && random() < 0.45,
      },
    };
  },
  "invoices.send_reminder": (input, random, context) => {
    const chance =
      input.tone === "Final" ? 0.55 : input.tone === "Firm" ? 0.45 : 0.35;
    const paid = random() < chance;
    return {
      output: { sent: true, paid_after: paid },
      recovered: paid ? amountOf(context) : 0,
    };
  },
  "invoices.retry_charge": (_input, random, context) => {
    const succeeded = random() < 0.4;
    return {
      output: { succeeded },
      recovered: succeeded ? amountOf(context) : 0,
    };
  },
  "calendar.create_event": (input, random) => ({
    output: {
      event_id: id("ev", random),
      starts_at: String(input.starts_at ?? ""),
      link: `https://meet.example/${id("k", random).slice(2)}`,
    },
  }),
  "calendar.check_confirmation": (_input, random) => ({
    output: { confirmed: random() < 0.7 },
  }),
  "chat.post": () => ({ output: { posted: true } }),
  "sheet.read_rows": (input) => {
    const rows = sheets[String(input.sheet)];
    if (!rows)
      throw new SimulatedError(
        `Sheet "${String(input.sheet)}" not found`,
        false,
      );
    return { output: { rows, count: rows.length } };
  },
  "sheet.append_row": (_input, random) => ({
    output: { row: between(random, 120, 980) },
  }),
  "tasks.create": (_input, random) => ({
    output: { task_id: id("tk", random) },
  }),
};

export function simulate(
  app: AppId,
  operation: string,
  input: Record<string, Json>,
  random: Random,
  context: Context,
  failureRate: number,
): SimulationResult {
  const handler = handlers[`${app}.${operation}`];
  if (!handler)
    throw new SimulatedError(`Unknown operation ${app}.${operation}`, false);
  if (random() < failureRate)
    throw new SimulatedError(pick(random, transientErrors), true);
  return handler(input, random, context);
}
