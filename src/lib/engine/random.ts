export type Random = () => number;

export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pick<T>(random: Random, list: readonly T[]): T {
  const item = list[Math.floor(random() * list.length)];
  if (item === undefined) throw new Error("Cannot pick from an empty list");
  return item;
}

export function between(random: Random, min: number, max: number) {
  return Math.round(min + random() * (max - min));
}
