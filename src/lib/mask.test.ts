import { describe, expect, it } from "vitest";
import { containsPersonalData, maskRecord, maskText } from "./mask";

describe("masking", () => {
  it("masks emails and phone numbers in any field", () => {
    expect(maskText("maya.okafor@example.com")).toBe("m•••@example.com");
    expect(maskText("(512) 555-0147")).toBe("(•••) •••-0147");
    expect(maskText("512-555-0147")).toBe("(•••) •••-0147");
    expect(maskText("Invoice INV-1042")).toBeNull();
  });

  it("masks secrets by key and leaves other values alone", () => {
    expect(
      maskRecord({
        api_key: "sk_live_123",
        amount: 1850,
        note: "Leaking heater",
        contact: { email: "a@b.co" },
        list: ["c@d.io"],
      }),
    ).toEqual({
      api_key: "••••••",
      amount: 1850,
      note: "Leaking heater",
      contact: { email: "a•••@b.co" },
      list: ["c•••@d.io"],
    });
  });

  it("masks personal fields even when the value is not a valid address", () => {
    expect(maskRecord({ to: "not a phone" })).toEqual({ to: "•••" });
  });

  it("reports whether a record has personal data", () => {
    expect(containsPersonalData({ email: "a@b.co" })).toBe(true);
    expect(containsPersonalData({ amount: 3 })).toBe(false);
    expect(containsPersonalData(null)).toBe(false);
  });
});
