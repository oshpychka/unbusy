import { getApp } from "@/data/apps";
import {
  stepIcon,
  stepSubtitle,
  stepTitle,
  stepTypeLabels,
  triggerEventOf,
} from "@/lib/engine/describe";
import type { Step, Trigger } from "@/lib/engine/types";

export function stepMeta(step: Step) {
  return {
    icon: stepIcon(step),
    kicker:
      step.type === "action"
        ? getApp(step.app).name
        : stepTypeLabels[step.type],
    title: stepTitle(step),
    subtitle: stepSubtitle(step),
  };
}

export function triggerMeta(trigger: Trigger) {
  const app = getApp(trigger.app);
  const event = triggerEventOf(trigger);
  const detail =
    trigger.config.form ??
    trigger.config.rule ??
    trigger.config.metric ??
    app.name;
  return {
    icon: app.icon,
    kicker: "Trigger",
    title: event?.label ?? "Choose a trigger",
    subtitle: detail,
  };
}
