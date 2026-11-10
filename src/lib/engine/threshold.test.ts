import { describe, expect, it } from "vitest";
import { evaluateThreshold } from "./threshold";

describe("evaluateThreshold", () => {
  const base = {
    limit: 40,
    warnPct: 80,
    alertPct: 95,
    elapsedDays: 20,
    periodDays: 30,
  };

  it("assigns states by percentage", () => {
    expect(evaluateThreshold({ ...base, used: 20 }).state).toBe("green");
    expect(evaluateThreshold({ ...base, used: 33 }).state).toBe("yellow");
    expect(evaluateThreshold({ ...base, used: 38 }).state).toBe("red");
  });

  it("forecasts the period end from the current pace", () => {
    const result = evaluateThreshold({ ...base, used: 30 });
    expect(result.forecast).toBe(45);
    expect(result.forecastPct).toBe(113);
    expect(result.overLimit).toBe(true);
  });

  it("handles a zero limit", () => {
    expect(evaluateThreshold({ ...base, limit: 0, used: 5 }).usedPct).toBe(0);
  });
});
