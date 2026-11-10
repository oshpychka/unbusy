"use client";

import { Field, fieldDescribedBy } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { InputField } from "@/lib/engine/types";
import { TokenInput } from "../TokenInput";
import type { FieldContext } from "./field-context";

type InputFieldControlProps = {
  id: string;
  field: InputField;
  value: string;
  onChange: (value: string) => void;
  scope?: FieldContext;
};

export function InputFieldControl({
  id,
  field,
  value,
  onChange,
  scope,
}: InputFieldControlProps) {
  const missing = field.required && !value.trim();
  const describedBy = fieldDescribedBy(id);

  let control: React.ReactNode;
  if (field.type === "select" && field.options) {
    const options = field.options.map((option) => ({
      value: option,
      label: option,
    }));
    control = (
      <Select
        id={id}
        value={value}
        options={options}
        onChange={onChange}
        describedBy={describedBy}
        invalid={missing}
      />
    );
  } else if (scope) {
    control = (
      <TokenInput
        id={id}
        value={value}
        onChange={onChange}
        fields={scope.fields}
        context={scope.context}
        multiline={field.type === "longtext"}
        placeholder={field.placeholder ?? "Type text or {{ to insert a field"}
        describedBy={describedBy}
      />
    );
  } else {
    control = (
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={field.type === "number" ? "decimal" : undefined}
        aria-describedby={describedBy}
        aria-invalid={missing || undefined}
      />
    );
  }

  return (
    <Field
      id={id}
      label={field.label}
      optional={!field.required}
      error={missing ? "Required" : undefined}
    >
      {control}
    </Field>
  );
}
