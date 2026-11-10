"use client";

import { useId, useMemo, useRef, useState } from "react";
import { controlClass } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  formatterNames,
  renderText,
  type Context,
} from "@/lib/engine/expressions";
import { unknownTokens } from "@/lib/engine/preview";
import type { ScopeField } from "@/lib/engine/scope";

type TokenInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  fields: ScopeField[];
  context: Context;
  multiline?: boolean;
  placeholder?: string;
  describedBy?: string;
};

function openQuery(text: string, caret: number) {
  const before = text.slice(0, caret);
  const start = before.lastIndexOf("{{");
  if (start === -1 || before.slice(start).includes("}}")) return null;
  return {
    start,
    query: before
      .slice(start + 2)
      .trim()
      .toLowerCase(),
  };
}

export function TokenInput({
  id,
  value,
  onChange,
  fields,
  context,
  multiline,
  placeholder,
  describedBy,
}: TokenInputProps) {
  const listId = useId();
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [caret, setCaret] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const [picker, setPicker] = useState(false);

  const query = caret === null ? null : openQuery(value, caret);
  const open = picker || query !== null;
  const matches = useMemo(() => {
    const text = query?.query ?? "";
    return fields
      .filter(
        (field) =>
          !text ||
          field.path.toLowerCase().includes(text) ||
          field.label.toLowerCase().includes(text),
      )
      .slice(0, 40);
  }, [fields, query?.query]);

  const unknown = unknownTokens(value, fields);
  let preview = "";
  let previewError = "";
  try {
    preview = renderText(value, context);
  } catch (error) {
    previewError = error instanceof Error ? error.message : "Cannot preview";
  }

  function insert(field: ScopeField) {
    const position = caret ?? value.length;
    const start = query?.start ?? position;
    const token = `{{${field.path}}}`;
    const next = value.slice(0, start) + token + value.slice(position);
    onChange(next);
    setPicker(false);
    const nextCaret = start + token.length;
    setCaret(nextCaret);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(nextCaret, nextCaret);
    });
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open || matches.length === 0) return;
    if (event.key === "ArrowDown")
      setActive((index) => Math.min(matches.length - 1, index + 1));
    else if (event.key === "ArrowUp")
      setActive((index) => Math.max(0, index - 1));
    else if (event.key === "Enter" || event.key === "Tab")
      insert(matches[active] ?? matches[0]!);
    else if (event.key === "Escape") {
      setPicker(false);
      setCaret(null);
    } else return;
    event.preventDefault();
  }

  const shared = {
    ref,
    id,
    value,
    placeholder,
    role: "combobox",
    "aria-expanded": open,
    "aria-controls": listId,
    "aria-autocomplete": "list" as const,
    "aria-activedescendant":
      open && matches[active] ? `${listId}-${active}` : undefined,
    "aria-describedby": [describedBy, `${id}-preview`]
      .filter(Boolean)
      .join(" "),
    "aria-invalid": unknown.length > 0 || undefined,
    spellCheck: false,
    onKeyDown,
    onBlur: () => window.setTimeout(() => setPicker(false), 120),
    onSelect: (
      event: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setCaret(event.currentTarget.selectionStart);
      setActive(0);
    },
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      onChange(event.target.value);
      setCaret(event.target.selectionStart);
    },
  };

  return (
    <div className="relative">
      <div className="relative">
        {multiline ? (
          <textarea
            {...shared}
            rows={3}
            className={cn(
              controlClass,
              "min-h-24 resize-none py-2.5 pr-11 font-mono text-sm leading-relaxed",
            )}
          />
        ) : (
          <input
            {...shared}
            className={cn(controlClass, "h-11 pr-11 font-mono text-sm md:h-10")}
          />
        )}
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setCaret(ref.current?.selectionStart ?? value.length);
            setPicker((state) => !state);
            ref.current?.focus();
          }}
          aria-label="Insert a field"
          title="Insert a field"
          className="absolute top-1 right-1 grid size-9 place-items-center rounded-sm text-muted hover:bg-sunken hover:text-primary md:size-8"
        >
          <Icon name="transform" size={18} />
        </button>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-surface p-1 shadow-overlay"
        >
          {matches.length === 0 && (
            <li className="px-2.5 py-2 text-sm text-muted">No fields match</li>
          )}
          {matches.map((field, index) => (
            <li
              key={field.path}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insert(field)}
              onPointerEnter={() => setActive(index)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2.5 py-1.5",
                index === active && "bg-sunken",
              )}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{field.label}</span>
                <span className="truncate font-mono text-xs text-muted">
                  {field.path}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted">{field.group}</span>
            </li>
          ))}
        </ul>
      )}

      <p id={`${id}-preview`} className="mt-1.5 min-h-5 text-xs break-words">
        {unknown.length > 0 ? (
          <span className="text-danger">
            Unknown field: {unknown.join(", ")}
          </span>
        ) : previewError ? (
          <span className="text-danger">
            {previewError}. Formatters: {formatterNames.join(", ")}
          </span>
        ) : value.includes("{{") ? (
          <span className="text-muted">
            Preview:{" "}
            <span className="font-mono text-text">{preview || "(empty)"}</span>
          </span>
        ) : null}
      </p>
    </div>
  );
}
