import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./ratelimit";

describe("createRateLimiter", () => {
  it("lets the first call through and spaces the next ones", () => {
    const limiter = createRateLimiter();
    expect(limiter.acquire("sms", 0).waitMs).toBe(0);
    expect(limiter.acquire("sms", 0).waitMs).toBe(2000);
    expect(limiter.acquire("sms", 0).waitMs).toBe(4000);
  });

  it("keeps apps independent", () => {
    const limiter = createRateLimiter();
    limiter.acquire("sms", 0);
    expect(limiter.acquire("email", 0).waitMs).toBe(0);
  });

  it("rejects a deep burst, slows down, and recovers after calm calls", () => {
    const limiter = createRateLimiter();
    const results = Array.from({ length: 12 }, () => limiter.acquire("sms", 0));
    expect(results.some((result) => result.rejected)).toBe(true);
    expect(limiter.penalty("sms")).toBeGreaterThan(1);

    let now = 10 * 60_000;
    for (let index = 0; index < 60; index++) {
      limiter.acquire("sms", now);
      now += 60_000;
    }
    expect(limiter.penalty("sms")).toBe(1);
  });

  it("caps the penalty", () => {
    const limiter = createRateLimiter();
    for (let index = 0; index < 50; index++) limiter.acquire("email", 0);
    expect(limiter.penalty("email")).toBeLessThanOrEqual(5);
  });
});

describe("createRateLimiter with out of order calls", () => {
  it("fills earlier gaps instead of queueing behind later calls", () => {
    const limiter = createRateLimiter();
    limiter.acquire("crm", 10 * 86_400_000);
    expect(limiter.acquire("crm", 3 * 86_400_000)).toEqual({
      waitMs: 0,
      rejected: false,
    });
  });
});
