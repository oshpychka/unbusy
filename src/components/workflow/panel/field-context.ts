import type { Context } from "@/lib/engine/expressions";
import type { ScopeField } from "@/lib/engine/scope";

export type FieldContext = { fields: ScopeField[]; context: Context };

export type EditorProps<T> = {
  step: T;
  scope: FieldContext;
  onChange: (step: T) => void;
};
