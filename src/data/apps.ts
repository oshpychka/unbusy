import type { AppId } from "@/lib/engine/types";
import { businessApps } from "./apps-business";
import { coreApps } from "./apps-core";

export const apps = [...coreApps, ...businessApps];

export function getApp(id: AppId) {
  const app = apps.find((item) => item.id === id);
  if (!app) throw new Error(`Unknown app: ${id}`);
  return app;
}
