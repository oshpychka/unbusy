"use client";

import { Button, IconButton } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Select } from "@/components/ui/Select";
import { operatorLabels } from "@/lib/engine/conditions";
import type { Condition, Operator } from "@/lib/engine/types";
import { TokenInput } from "../TokenInput";
import type { FieldContext } from "./field-context";

const operatorOptions = (Object.keys(operatorLabels) as Operator[]).map(
  (value) => ({ value, label: operatorLabels[value] }),
);
const noRight: Operator[] = ["is_empty", "is_not_empty"];

type ConditionsEditorProps = {
  stepId: string;
  match: "all" | "any";
  conditions: Condition[];
  scope: FieldContext;
  onChange: (match: "all" | "any", conditions: Condition[]) => void;
};

export function ConditionsEditor({
  stepId,
  match,
  conditions,
  scope,
  onChange,
}: ConditionsEditorProps) {
  function update(id: string, patch: Partial<Condition>) {
    onChange(
      match,
      conditions.map((condition) =>
        condition.id === id ? { ...condition, ...patch } : condition,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {conditions.length > 1 && (
        <Segmented
          label="Match"
          value={match}
          options={[
            { value: "all", label: "All conditions" },
            { value: "any", label: "Any condition" },
          ]}
          onChange={(value) => onChange(value, conditions)}
        />
      )}
      {conditions.map((condition, index) => (
        <fieldset
          key={condition.id}
          className="flex flex-col gap-2 rounded-md border border-line p-3"
        >
          <legend className="flex w-full items-center justify-between px-1 text-xs text-muted">
            Condition {index + 1}
          </legend>
          <TokenInput
            id={`${condition.id}-left`}
            value={condition.left}
            onChange={(left) => update(condition.id, { left })}
            fields={scope.fields}
            context={scope.context}
            placeholder="{{trigger.amount}}"
          />
          <Select
            label={`Condition ${index + 1} operator`}
            value={condition.operator}
            options={operatorOptions}
            onChange={(operator) => update(condition.id, { operator })}
          />
          {!noRight.includes(condition.operator) && (
            <TokenInput
              id={`${condition.id}-right`}
              value={condition.right}
              onChange={(right) => update(condition.id, { right })}
              fields={scope.fields}
              context={scope.context}
              placeholder={
                condition.operator.startsWith("days") ? "Days" : "Value"
              }
            />
          )}
          {condition.operator === "between" && (
            <TokenInput
              id={`${condition.id}-right2`}
              value={condition.right2 ?? ""}
              onChange={(right2) => update(condition.id, { right2 })}
              fields={scope.fields}
              context={scope.context}
              placeholder="Upper value"
            />
          )}
          {conditions.length > 1 && (
            <IconButton
              icon="trash"
              label={`Remove condition ${index + 1}`}
              size="sm"
              className="self-end text-danger"
              onClick={() =>
                onChange(
                  match,
                  conditions.filter((item) => item.id !== condition.id),
                )
              }
            />
          )}
        </fieldset>
      ))}
      <Button
        variant="secondary"
        size="sm"
        icon="plus"
        className="self-start"
        onClick={() =>
          onChange(match, [
            ...conditions,
            {
              id: `${stepId}_c${Date.now().toString(36)}`,
              left: "",
              operator: "equals",
              right: "",
            },
          ])
        }
      >
        Add condition
      </Button>
    </div>
  );
}
