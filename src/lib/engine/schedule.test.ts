import { describe, expect, it } from "vitest";
import {
  describeSchedule,
  formatSchedule,
  nextRuns,
  parseSchedule,
} from "./schedule";

describe("parseSchedule", () => {
  it("parses every supported form", () => {
    expect(parseSchedule("every 15 minutes")).toEqual({
      kind: "minutes",
      every: 15,
    });
    expect(parseSchedule("Every 2 Hours")).toEqual({ kind: "hours", every: 2 });
    expect(parseSchedule("daily at 9:00")).toEqual({
      kind: "daily",
      time: "9:00",
    });
    expect(parseSchedule("weekdays at 08:30")).toEqual({
      kind: "weekdays",
      time: "08:30",
    });
    expect(parseSchedule("weekly on monday at 08:00")).toEqual({
      kind: "weekly",
      day: 1,
      time: "08:00",
    });
    expect(parseSchedule("monthly on day 1 at 09:00")).toEqual({
      kind: "monthly",
      day: 1,
      time: "09:00",
    });
  });

  it("rejects invalid rules", () => {
    for (const rule of [
      "",
      "sometimes",
      "every 0 minutes",
      "every 90 minutes",
      "daily at 25:00",
      "weekly on funday at 08:00",
      "monthly on day 31 at 09:00",
    ]) {
      expect(parseSchedule(rule), rule).toBeNull();
    }
  });

  it("formats back to the same rule", () => {
    for (const rule of [
      "every 15 minutes",
      "weekdays at 08:30",
      "weekly on friday at 17:00",
      "monthly on day 15 at 09:00",
    ]) {
      expect(formatSchedule(parseSchedule(rule)!)).toBe(rule);
    }
  });

  it("describes rules in plain words", () => {
    expect(describeSchedule(parseSchedule("weekly on monday at 08:00")!)).toBe(
      "Every Monday at 8:00 AM",
    );
    expect(describeSchedule(parseSchedule("every 1 hours")!)).toBe(
      "Every hour",
    );
  });
});

describe("nextRuns", () => {
  const from = new Date(2026, 10, 10, 10, 0);

  it("skips weekends for weekday rules", () => {
    const runs = nextRuns(parseSchedule("weekdays at 09:00")!, from, 5);
    expect(runs.map((date) => date.getDay())).toEqual([3, 4, 5, 1, 2]);
    expect(runs[0]!.getHours()).toBe(9);
  });

  it("includes today when the time has not passed", () => {
    expect(
      nextRuns(parseSchedule("daily at 17:30")!, from, 1)[0]!.getDate(),
    ).toBe(10);
  });

  it("finds monthly and weekly dates", () => {
    expect(
      nextRuns(parseSchedule("monthly on day 1 at 09:00")!, from, 2).map(
        (date) => date.getMonth(),
      ),
    ).toEqual([11, 0]);
    expect(
      nextRuns(
        parseSchedule("weekly on monday at 08:00")!,
        from,
        1,
      )[0]!.getDate(),
    ).toBe(16);
  });

  it("steps by interval for minute rules", () => {
    const runs = nextRuns(parseSchedule("every 15 minutes")!, from, 3);
    expect(runs[1]!.getTime() - runs[0]!.getTime()).toBe(15 * 60_000);
  });
});
