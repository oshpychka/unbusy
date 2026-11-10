import type { Json } from "@/lib/engine/types";

const emailPattern = /^([^\s@])[^\s@]*(@[^\s@]+\.[^\s@]+)$/;
const phonePattern = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?(\d{4})$/;
const secretKey = /(key|token|secret|password)$/i;
const personalKey = /(email|phone|^to)$/i;

export function maskText(value: string) {
  const email = value.match(emailPattern);
  if (email) return `${email[1]}•••${email[2]}`;
  const phone = value.trim().match(phonePattern);
  if (phone) return `(•••) •••-${phone[1]}`;
  return null;
}

export function maskValue(key: string, value: Json): Json {
  if (value === null) return value;
  if (Array.isArray(value)) return value.map((item) => maskValue(key, item));
  if (typeof value === "object") return maskRecord(value);
  if (typeof value !== "string") return value;
  if (secretKey.test(key)) return "••••••";
  const masked = maskText(value);
  if (masked) return masked;
  return personalKey.test(key) && value ? "•••" : value;
}

export function maskRecord(record: { [key: string]: Json }): {
  [key: string]: Json;
} {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, maskValue(key, value)]),
  );
}

export function containsPersonalData(record: { [key: string]: Json } | null) {
  return (
    record !== null &&
    JSON.stringify(maskRecord(record)) !== JSON.stringify(record)
  );
}
