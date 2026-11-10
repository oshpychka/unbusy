import { getApp } from "@/data/apps";
import type { AppId } from "./types";

const maxPenalty = 5;
const recoverAfter = 15;
const rejectAfter = 8;

type AppState = { slots: number[]; penalty: number; okStreak: number };

export type Throttle = { waitMs: number; rejected: boolean };

export type RateLimiter = {
  acquire: (app: AppId, now: number) => Throttle;
  penalty: (app: AppId) => number;
};

function firstFreeSlot(slots: number[], now: number, interval: number) {
  let time = now;
  for (const slot of slots) {
    if (slot + interval <= time) continue;
    if (slot >= time + interval) break;
    time = slot + interval;
  }
  return time;
}

function insertSorted(slots: number[], time: number) {
  let index = slots.length;
  while (index > 0 && slots[index - 1]! > time) index--;
  slots.splice(index, 0, time);
}

export function createRateLimiter(): RateLimiter {
  const states = new Map<AppId, AppState>();

  function state(app: AppId) {
    let current = states.get(app);
    if (!current) {
      current = { slots: [], penalty: 1, okStreak: 0 };
      states.set(app, current);
    }
    return current;
  }

  return {
    acquire(app, now) {
      const current = state(app);
      const interval = (60_000 / getApp(app).ratePerMinute) * current.penalty;
      const slot = firstFreeSlot(current.slots, now, interval);
      const waitMs = slot - now;
      if (waitMs > interval * rejectAfter) {
        current.penalty = Math.min(maxPenalty, current.penalty * 2);
        current.okStreak = 0;
        return { waitMs: 0, rejected: true };
      }
      current.okStreak++;
      if (current.okStreak >= recoverAfter && current.penalty > 1) {
        current.penalty = Math.max(1, current.penalty * 0.75);
        current.okStreak = 0;
      }
      insertSorted(current.slots, slot);
      return { waitMs, rejected: false };
    },
    penalty: (app) => state(app).penalty,
  };
}
