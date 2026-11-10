"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./Button";
import { Icon, type IconName } from "./Icon";

export type MenuItem = {
  label: string;
  icon: IconName;
  onSelect: () => void;
  tone?: "danger";
};

export function Menu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent) {
    const buttons = [
      ...(list.current?.querySelectorAll<HTMLButtonElement>("button") ?? []),
    ];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      setOpen(false);
      root.current?.querySelector<HTMLButtonElement>("button")?.focus();
    } else if (event.key === "ArrowDown")
      buttons[(index + 1) % buttons.length]?.focus();
    else if (event.key === "ArrowUp")
      buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    else return;
    event.preventDefault();
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <IconButton
        icon="dots"
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      />
      {open && (
        <ul
          ref={list}
          id={id}
          role="menu"
          className="absolute right-0 z-40 mt-1 w-56 rounded-md border border-line bg-surface p-1 shadow-overlay"
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex min-h-11 w-full items-center gap-2 rounded-sm px-2.5 text-left text-sm hover:bg-sunken focus:bg-sunken focus:outline-none md:min-h-9",
                  item.tone === "danger" && "text-danger",
                )}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
