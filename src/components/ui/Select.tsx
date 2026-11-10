"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { controlClass } from "./Field";
import { Icon } from "./Icon";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type SelectProps<T extends string> = {
  id?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  describedBy?: string;
  invalid?: boolean;
  className?: string;
};

export function Select<T extends string>({
  id,
  value,
  options,
  onChange,
  label,
  describedBy,
  invalid,
  className,
}: SelectProps<T>) {
  const fallbackId = useId();
  const buttonId = id ?? fallbackId;
  const listId = `${buttonId}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function openList() {
    setActive(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "ArrowDown")
      setActive((index) => Math.min(options.length - 1, index + 1));
    else if (event.key === "ArrowUp")
      setActive((index) => Math.max(0, index - 1));
    else if (event.key === "Home") setActive(0);
    else if (event.key === "End") setActive(options.length - 1);
    else if (event.key === "Enter" || event.key === " ") choose(active);
    else if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
      return;
    } else return;
    event.preventDefault();
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={label}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          controlClass,
          "flex h-11 items-center justify-between gap-2 text-left md:h-10",
        )}
      >
        <span className="truncate">{selected?.label ?? "Choose"}</span>
        <Icon
          name="chevronDown"
          size={18}
          className={cn(
            "shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute z-30 mt-1 max-h-72 w-full min-w-48 overflow-auto rounded-md border border-line bg-surface p-1 shadow-overlay"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(index)}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-sm px-2.5 py-2 md:min-h-9",
                index === active && "bg-sunken",
              )}
            >
              <span className="flex flex-col">
                <span>{option.label}</span>
                {option.hint && (
                  <span className="text-xs text-muted">{option.hint}</span>
                )}
              </span>
              {option.value === value && (
                <Icon
                  name="check"
                  size={16}
                  className="shrink-0 text-primary"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
