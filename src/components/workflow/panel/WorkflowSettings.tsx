"use client";

import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Workflow } from "@/lib/engine/types";
import { PanelSection } from "./PanelSection";

type WorkflowSettingsProps = {
  workflow: Workflow;
  onChange: (workflow: Workflow) => void;
};

export function WorkflowSettings({
  workflow,
  onChange,
}: WorkflowSettingsProps) {
  const settings = workflow.settings;
  const setSettings = (patch: Partial<Workflow["settings"]>) =>
    onChange({ ...workflow, settings: { ...settings, ...patch } });

  return (
    <>
      <PanelSection title="About">
        <Field
          id="wf-name"
          label="Name"
          error={workflow.name.trim() ? undefined : "Give it a name"}
        >
          <Input
            id="wf-name"
            value={workflow.name}
            maxLength={80}
            onChange={(event) =>
              onChange({ ...workflow, name: event.target.value })
            }
          />
        </Field>
        <Field id="wf-description" label="Description" optional>
          <Textarea
            id="wf-description"
            value={workflow.description}
            maxLength={240}
            onChange={(event) =>
              onChange({ ...workflow, description: event.target.value })
            }
          />
        </Field>
      </PanelSection>
      <PanelSection title="Savings">
        <Field
          id="wf-minutes"
          label="Minutes of manual work per run"
          hint="Used for hours saved in analytics."
        >
          <Input
            id="wf-minutes"
            type="number"
            min={0}
            max={600}
            value={settings.manualMinutes}
            onChange={(event) =>
              setSettings({
                manualMinutes: Math.min(
                  600,
                  Math.max(0, Number(event.target.value) || 0),
                ),
              })
            }
          />
        </Field>
      </PanelSection>
      <PanelSection title="When a step fails">
        <Field id="wf-on-error" label="Default behavior">
          <Select
            id="wf-on-error"
            value={settings.onError}
            options={[
              {
                value: "stop",
                label: "Stop the run",
                hint: "Mark the run as failed",
              },
              { value: "continue", label: "Skip the step and continue" },
            ]}
            onChange={(onError) => setSettings({ onError })}
          />
        </Field>
        <Field id="wf-retries" label="Retries for temporary errors">
          <Select
            id="wf-retries"
            value={String(settings.retry.attempts)}
            options={["0", "1", "2", "3", "5"].map((value) => ({
              value,
              label: value === "0" ? "No retries" : `${value} retries`,
            }))}
            onChange={(value) =>
              setSettings({
                retry: { ...settings.retry, attempts: Number(value) },
              })
            }
          />
        </Field>
      </PanelSection>
    </>
  );
}
