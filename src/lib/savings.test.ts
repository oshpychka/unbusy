import { describe, expect, it } from "vitest";
import {
  decodeTask,
  encodeTasks,
  monthlyHours,
  totals,
  type SavingsTask,
} from "./savings";

const task: SavingsTask = {
  id: "chase-unpaid-invoices",
  name: "Chase unpaid invoices",
  count: 5,
  per: "week",
  minutes: 12,
};

describe("savings", () => {
  it("converts frequency into monthly hours", () => {
    expect(monthlyHours(task)).toBeCloseTo(4.33, 2);
    expect(
      monthlyHours({ ...task, per: "month", count: 60, minutes: 60 }),
    ).toBe(60);
  });

  it("totals hours and dollars", () => {
    const result = totals(
      [task, { ...task, per: "month", count: 10, minutes: 6 }],
      50,
    );
    expect(result.hoursPerMonth).toBeCloseTo(5.33, 2);
    expect(result.dollarsPerYear).toBeCloseTo(result.dollarsPerMonth * 12);
  });

  it("round-trips tasks through the URL format", () => {
    const [encoded] = encodeTasks([task]);
    expect(decodeTask(encoded!, { [task.id]: task.name })).toEqual(task);
  });

  it("rejects or clamps bad input", () => {
    expect(decodeTask("unknown:1:week:5", {})).toBeNull();
    expect(decodeTask("a:1:year:5", { a: "A" })).toBeNull();
    expect(decodeTask("a:abc:week:5", { a: "A" })).toBeNull();
    expect(decodeTask("a:99999:week:-4", { a: "A" })).toMatchObject({
      count: 1000,
      minutes: 0,
    });
  });
});
