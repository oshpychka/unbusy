import type { Playbook } from "@/data/playbooks";
import type { Workflow } from "./engine/types";

export const defaultSettings: Workflow["settings"] = {
  manualMinutes: 5,
  onError: "stop",
  retry: { attempts: 2, backoffMs: 5000 },
};

export function workflowFromPlaybook(
  playbook: Playbook,
  id: string,
  createdAt: string,
  name = playbook.title,
): Workflow {
  return {
    id,
    name,
    description: playbook.summary,
    enabled: true,
    trigger: structuredClone(playbook.trigger),
    steps: structuredClone(playbook.steps),
    settings: { ...defaultSettings, manualMinutes: playbook.manualMinutes },
    playbook: playbook.slug,
    createdAt,
    updatedAt: createdAt,
  };
}
