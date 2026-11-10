"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { stepTitle, stepTypeLabels } from "@/lib/engine/describe";
import {
  duplicateStep,
  findStep,
  locateStep,
  moveStep,
  removeStep,
  updateStep,
} from "@/lib/engine/edit";
import { previewContext } from "@/lib/engine/preview";
import { scopeAt } from "@/lib/engine/scope";
import type { Issue } from "@/lib/engine/lint";
import type { DataRecord, Step, Workflow } from "@/lib/engine/types";
import { IssueList } from "../IssueList";
import { ActionEditor } from "./ActionEditor";
import { DelayEditor } from "./DelayEditor";
import { LoopEditor } from "./LoopEditor";
import { SwitchEditor } from "./SwitchEditor";
import { TransformEditor } from "./TransformEditor";
import { ConditionsEditor } from "./ConditionsEditor";
import { ErrorHandling } from "./ErrorHandling";
import { PanelSection } from "./PanelSection";
import { TriggerEditor } from "./TriggerEditor";
import { WorkflowSettings } from "./WorkflowSettings";

type StepPanelProps = {
  workflow: Workflow;
  selected: string | null;
  payload: DataRecord | null;
  issues: Issue[];
  onChange: (update: (workflow: Workflow) => Workflow) => void;
  onSelect: (id: string | null) => void;
};

export function StepPanel({
  workflow,
  selected,
  payload,
  issues,
  onChange,
  onSelect,
}: StepPanelProps) {
  const step =
    selected && selected !== "trigger"
      ? findStep(workflow.steps, selected)
      : null;
  const scope = useMemo(() => {
    const fields = scopeAt(workflow, step?.id ?? null);
    return { fields, context: previewContext(fields, payload) };
  }, [workflow, step?.id, payload]);

  const issueBox = issues.length > 0 && (
    <div className="rounded-md border border-line bg-sunken p-3">
      <IssueList issues={issues} />
    </div>
  );

  if (selected === "trigger") {
    return (
      <div className="flex flex-col gap-5">
        {issueBox}
        <TriggerEditor
          trigger={workflow.trigger}
          onChange={(trigger) =>
            onChange((current) => ({ ...current, trigger }))
          }
        />
      </div>
    );
  }

  if (!step) {
    return (
      <WorkflowSettings
        workflow={workflow}
        onChange={(next) => onChange(() => next)}
      />
    );
  }

  const save = (next: Step) =>
    onChange((current) => ({
      ...current,
      steps: updateStep(current.steps, step.id, () => next),
    }));
  const slot = locateStep(workflow.steps, step.id);

  return (
    <div className="flex flex-col gap-5">
      {issueBox}
      <Field
        id={`${step.id}-name`}
        label={`${stepTypeLabels[step.type]} name`}
        hint="Shown on the canvas and in run logs."
      >
        <Input
          id={`${step.id}-name`}
          value={step.name ?? ""}
          placeholder={stepTitle({ ...step, name: undefined })}
          maxLength={60}
          onChange={(event) =>
            save({ ...step, name: event.target.value || undefined })
          }
        />
      </Field>

      {step.type === "action" && (
        <>
          <ActionEditor step={step} scope={scope} onChange={save} />
          <ErrorHandling
            step={step}
            settings={workflow.settings}
            onChange={save}
          />
        </>
      )}
      {(step.type === "if" || step.type === "filter") && (
        <PanelSection
          title={
            step.type === "if"
              ? "Go down the Yes path when"
              : "Continue only when"
          }
        >
          <ConditionsEditor
            stepId={step.id}
            match={step.match}
            conditions={step.conditions}
            scope={scope}
            onChange={(match, conditions) =>
              save({ ...step, match, conditions })
            }
          />
        </PanelSection>
      )}
      {step.type === "switch" && (
        <SwitchEditor step={step} scope={scope} onChange={save} />
      )}
      {step.type === "delay" && (
        <DelayEditor step={step} scope={scope} onChange={save} />
      )}
      {step.type === "transform" && (
        <TransformEditor step={step} scope={scope} onChange={save} />
      )}
      {step.type === "loop" && (
        <LoopEditor step={step} scope={scope} onChange={save} />
      )}

      <PanelSection title="Step">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon="arrowUp"
            disabled={!slot || slot.index === 0}
            onClick={() =>
              onChange((current) => ({
                ...current,
                steps: moveStep(current.steps, step.id, -1),
              }))
            }
          >
            Move up
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon="arrowDown"
            onClick={() =>
              onChange((current) => ({
                ...current,
                steps: moveStep(current.steps, step.id, 1),
              }))
            }
          >
            Move down
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon="copy"
            onClick={() =>
              onChange((current) => ({
                ...current,
                steps: duplicateStep(current.steps, step.id),
              }))
            }
          >
            Duplicate
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon="trash"
            onClick={() => {
              onChange((current) => ({
                ...current,
                steps: removeStep(current.steps, step.id),
              }));
              onSelect(null);
            }}
          >
            Delete
          </Button>
        </div>
      </PanelSection>
    </div>
  );
}
