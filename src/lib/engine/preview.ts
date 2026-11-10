import type { Context } from "./expressions";
import { tokensIn } from "./expressions";
import type { ScopeField } from "./scope";
import type { DataRecord, Json } from "./types";

function setPath(target: Record<string, Json>, path: string[], value: Json) {
  let cursor = target;
  for (const [index, key] of path.entries()) {
    if (index === path.length - 1) {
      cursor[key] = value;
      return;
    }
    const next = cursor[key];
    if (typeof next !== "object" || next === null || Array.isArray(next))
      cursor[key] = {};
    cursor = cursor[key] as Record<string, Json>;
  }
}

export function previewContext(
  fields: ScopeField[],
  payload?: DataRecord | null,
): Context {
  const root: Record<string, Json> = {
    trigger: {},
    steps: {},
    run: { now: new Date().toISOString() },
  };
  for (const field of fields)
    setPath(root, field.path.split("."), field.sample);
  if (payload) root.trigger = { ...(root.trigger as DataRecord), ...payload };
  return root as unknown as Context;
}

export function unknownTokens(template: string, fields: ScopeField[]) {
  const known = new Set(fields.map((field) => field.path));
  return tokensIn(template)
    .map((token) => token.path)
    .filter(
      (path) =>
        !known.has(path) &&
        ![...known].some((item) => path.startsWith(`${item}.`)),
    );
}
