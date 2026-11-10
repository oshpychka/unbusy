"use client";

import type { LoopStep } from "@/lib/engine/types";
import { TokenInput } from "../TokenInput";
import type { EditorProps } from "./field-context";
import { PanelSection } from "./PanelSection";

export function LoopEditor({ step, scope, onChange }: EditorProps<LoopStep>) {
  const lists = scope.fields.filter((field) => field.type === "list");
  return (
    <PanelSection title="Repeat for each item in">
      <TokenInput
        id={`${step.id}-list`}
        value={step.list}
        onChange={(list) => onChange({ ...step, list })}
        fields={lists}
        context={scope.context}
        placeholder="{{steps.read_rows.rows}}"
      />
      <p className="text-xs text-muted">
        Inside the loop, use {"{{item.field}}"} to read the current item. Up to
        100 items per run.
      </p>
    </PanelSection>
  );
}
