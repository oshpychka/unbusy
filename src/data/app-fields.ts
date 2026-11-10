import type { FieldType, InputField, OutputField } from "@/lib/engine/types";

export function input(
  key: string,
  label: string,
  type: FieldType = "text",
  required = true,
  options?: string[],
): InputField {
  return { key, label, type, required, options };
}

export function out(
  path: string,
  label: string,
  type: OutputField["type"],
  sample: OutputField["sample"],
): OutputField {
  return { path, label, type, sample };
}

export const contactOutputs = [
  out("id", "Contact ID", "text", "ct_4821"),
  out("name", "Name", "text", "Maya Okafor"),
  out("email", "Email", "text", "maya.okafor@example.com"),
  out("phone", "Phone", "text", "(512) 555-0147"),
  out("owner", "Owner", "text", "Jordan Reyes"),
  out("lifetime_value", "Lifetime value", "number", 4200),
];

export const invoiceOutputs = [
  out("number", "Invoice number", "text", "INV-1042"),
  out("client_name", "Client name", "text", "Harbor Dental Group"),
  out("client_email", "Client email", "text", "billing@harbordental.example"),
  out("client_phone", "Client phone", "text", "(206) 555-0118"),
  out("amount", "Amount", "number", 1850),
  out("due_date", "Due date", "date", "2026-10-01"),
];
