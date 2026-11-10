import type { Playbook } from "@/data/playbooks";
import type { Workflow } from "./engine/types";
import type { WorkflowDraft } from "./engine/validate";

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

export const blankDraft: WorkflowDraft = {
  name: "Untitled workflow",
  description: "",
  trigger: { app: "forms", event: "submitted", config: { form: "Contact" } },
  steps: [],
  settings: defaultSettings,
};
