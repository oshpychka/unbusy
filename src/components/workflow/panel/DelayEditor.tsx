"use client";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { Select } from "@/components/ui/Select";
import type { DelayStep } from "@/lib/engine/types";
import { TokenInput } from "../TokenInput";
import type { EditorProps } from "./field-context";
import { PanelSection } from "./PanelSection";

export function DelayEditor({ step, scope, onChange }: EditorProps<DelayStep>) {
  return (
    <PanelSection title="Wait">
      <Segmented
        label="Wait mode"
        value={step.mode}
        options={[
          { value: "for", label: "For a while" },
          { value: "until", label: "Until a time" },
        ]}
        onChange={(mode) => onChange({ ...step, mode })}
      />
      {step.mode === "for" ? (
        <div className="grid grid-cols-2 gap-2">
          <Field id={`${step.id}-amount`} label="Amount">
            <Input
              id={`${step.id}-amount`}
              type="number"
              min={1}
              value={step.amount}
              onChange={(event) =>
                onChange({
                  ...step,
                  amount: Math.max(0, Number(event.target.value) || 0),
                })
              }
            />
          </Field>
          <Field id={`${step.id}-unit`} label="Unit">
            <Select
              id={`${step.id}-unit`}
              value={step.unit}
              options={[
                { value: "minutes", label: "Minutes" },
                { value: "hours", label: "Hours" },
                { value: "days", label: "Days" },
              ]}
              onChange={(unit) => onChange({ ...step, unit })}
            />
          </Field>
        </div>
      ) : (
        <Field
          id={`${step.id}-until`}
          label="Resume at"
          hint="A date field, for example {{trigger.starts_at | subtract_hours:24}}"
        >
          <TokenInput
            id={`${step.id}-until`}
            value={step.until}
            onChange={(until) => onChange({ ...step, until })}
            fields={scope.fields}
            context={scope.context}
          />
        </Field>
      )}
    </PanelSection>
  );
}
