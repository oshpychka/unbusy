"use client";

import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { apps } from "@/data/apps";
import { operationOf } from "@/lib/engine/describe";
import type { ActionStep, AppId } from "@/lib/engine/types";
import type { FieldContext } from "./field-context";
import { InputFieldControl } from "./InputFieldControl";
import { PanelSection } from "./PanelSection";

const operationOptions = apps.flatMap((app) =>
  app.operations.map((operation) => ({
    value: `${app.id}.${operation.id}`,
    label: operation.label,
    hint: app.name,
  })),
);

type ActionEditorProps = {
  step: ActionStep;
  scope: FieldContext;
  onChange: (step: ActionStep) => void;
};

export function ActionEditor({ step, scope, onChange }: ActionEditorProps) {
  const operation = operationOf(step);

  return (
    <>
      <PanelSection title="Do this">
        <Field
          id={`${step.id}-operation`}
          label="Action"
          hint={
            operation?.kind === "write"
              ? "Changes data in the app"
              : "Reads data only"
          }
        >
          <Select
            id={`${step.id}-operation`}
            value={`${step.app}.${step.operation}`}
            options={operationOptions}
            onChange={(value) => {
              const [app, id] = value.split(".") as [AppId, string];
              onChange({ ...step, app, operation: id, fields: {} });
            }}
          />
        </Field>
      </PanelSection>
      {operation && operation.fields.length > 0 && (
        <PanelSection title="Fields">
          {operation.fields.map((field) => (
            <InputFieldControl
              key={`${step.id}-${field.key}`}
              id={`${step.id}-${field.key}`}
              field={field}
              value={step.fields[field.key] ?? ""}
              scope={scope}
              onChange={(value) =>
                onChange({
                  ...step,
                  fields: { ...step.fields, [field.key]: value },
                })
              }
            />
          ))}
        </PanelSection>
      )}
    </>
  );
}
