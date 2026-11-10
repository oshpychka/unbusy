"use client";

import { Button, IconButton } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { TransformStep } from "@/lib/engine/types";
import { TokenInput } from "../TokenInput";
import type { EditorProps } from "./field-context";
import { PanelSection } from "./PanelSection";

export function TransformEditor({
  step,
  scope,
  onChange,
}: EditorProps<TransformStep>) {
  return (
    <PanelSection title="Fields to set">
      {step.assignments.map((assignment, index) => (
        <div
          key={assignment.id}
          className="flex flex-col gap-2 rounded-md border border-line p-3"
        >
          <div className="flex items-end gap-2">
            <Field id={`${assignment.id}-key`} label="Name" className="flex-1">
              <Input
                id={`${assignment.id}-key`}
                mono
                value={assignment.key}
                onChange={(event) =>
                  onChange({
                    ...step,
                    assignments: step.assignments.map((item) =>
                      item.id === assignment.id
                        ? {
                            ...item,
                            key: event.target.value
                              .replace(/[^a-z0-9_]/gi, "_")
                              .toLowerCase(),
                          }
                        : item,
                    ),
                  })
                }
              />
            </Field>
            <IconButton
              icon="trash"
              label={`Remove field ${index + 1}`}
              className="mb-6 text-danger"
              disabled={step.assignments.length === 1}
              onClick={() =>
                onChange({
                  ...step,
                  assignments: step.assignments.filter(
                    (item) => item.id !== assignment.id,
                  ),
                })
              }
            />
          </div>
          <TokenInput
            id={`${assignment.id}-value`}
            value={assignment.value}
            onChange={(value) =>
              onChange({
                ...step,
                assignments: step.assignments.map((item) =>
                  item.id === assignment.id ? { ...item, value } : item,
                ),
              })
            }
            fields={scope.fields}
            context={scope.context}
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
            assignments: [
              ...step.assignments,
              {
                id: `${step.id}_a${Date.now().toString(36)}`,
                key: `field_${step.assignments.length + 1}`,
                value: "",
              },
            ],
          })
        }
      >
        Add field
      </Button>
    </PanelSection>
  );
}
