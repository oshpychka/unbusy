"use client";

import { Button, IconButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { SwitchStep } from "@/lib/engine/types";
import { TokenInput } from "../TokenInput";
import type { EditorProps } from "./field-context";
import { PanelSection } from "./PanelSection";

export function SwitchEditor({
  step,
  scope,
  onChange,
}: EditorProps<SwitchStep>) {
  return (
    <>
      <PanelSection title="Value to check">
        <TokenInput
          id={`${step.id}-value`}
          value={step.value}
          onChange={(value) => onChange({ ...step, value })}
          fields={scope.fields}
          context={scope.context}
        />
      </PanelSection>
      <PanelSection title="Cases">
        {step.cases.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"
          >
            <Field id={`${item.id}-label`} label="Label">
              <Input
                id={`${item.id}-label`}
                value={item.label}
                onChange={(event) =>
                  onChange({
                    ...step,
                    cases: step.cases.map((c) =>
                      c.id === item.id
                        ? { ...c, label: event.target.value }
                        : c,
                    ),
                  })
                }
              />
            </Field>
            <Field id={`${item.id}-equals`} label="When value is">
              <Input
                id={`${item.id}-equals`}
                mono
                value={item.equals}
                onChange={(event) =>
                  onChange({
                    ...step,
                    cases: step.cases.map((c) =>
                      c.id === item.id
                        ? { ...c, equals: event.target.value }
                        : c,
                    ),
                  })
                }
              />
            </Field>
            <IconButton
              icon="trash"
              label={`Remove case ${index + 1}`}
              className="mb-6 text-danger"
              disabled={step.cases.length === 1}
              onClick={() =>
                onChange({
                  ...step,
                  cases: step.cases.filter((c) => c.id !== item.id),
                })
              }
            />
          </div>
        ))}
        <Button
          variant="secondary"
          size="sm"
          icon="plus"
          className="self-start"
          onClick={() =>
            onChange({
              ...step,
              cases: [
                ...step.cases,
                {
                  id: `${step.id}_case${Date.now().toString(36)}`,
                  label: `Case ${step.cases.length + 1}`,
                  equals: "",
                  steps: [],
                },
              ],
            })
          }
        >
          Add case
        </Button>
      </PanelSection>
    </>
  );
}
