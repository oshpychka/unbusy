"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  applyThemePreference,
  readThemePreference,
  resolveTheme,
} from "@/lib/theme";
import { useWorkspace } from "@/lib/store/workspace";
import { blankDraft } from "@/lib/workflow-factory";
import { commandItems, filterCommands } from "./command-items";

export function openCommandPalette() {
  window.dispatchEvent(new Event("unbusy-command"));
}

export function CommandPalette() {
  const router = useRouter();
  const workflows = useWorkspace((state) => state.workflows);
  const addDraft = useWorkspace((state) => state.addDraft);
  const createFromPlaybook = useWorkspace((state) => state.createFromPlaybook);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((state) => !state);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("unbusy-command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("unbusy-command", onOpen);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const items = useMemo(
    () =>
      commandItems(workflows, {
        go: (href) => router.push(href),
        newWorkflow: () =>
          router.push(`/app/workflows/${addDraft(blankDraft)}`),
        usePlaybook: (slug) => {
          const id = createFromPlaybook(slug);
          if (id) router.push(`/app/workflows/${id}`);
        },
        toggleTheme: () =>
          applyThemePreference(
            resolveTheme(readThemePreference()) === "dark" ? "light" : "dark",
          ),
      }),
    [workflows, router, addDraft, createFromPlaybook],
  );
  const results = filterCommands(items, query).slice(0, 30);

  function close() {
    setOpen(false);
    setQuery("");
    setActive(0);
  }

  function choose(index: number) {
    const item = results[index];
    if (!item) return;
    close();
    item.run();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown")
      setActive((index) => Math.min(results.length - 1, index + 1));
    else if (event.key === "ArrowUp")
      setActive((index) => Math.max(0, index - 1));
    else if (event.key === "Enter") choose(active);
    else return;
    event.preventDefault();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search pages, workflows and actions"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="inset-x-4 top-[12vh] m-0 mx-auto w-auto max-w-xl rounded-lg border border-line bg-surface p-0 text-text shadow-overlay backdrop:bg-overlay sm:inset-x-0 sm:w-full"
    >
      {open && (
        <div onKeyDown={onKeyDown}>
          <div className="flex items-center gap-2 border-b border-line px-4">
            <Icon name="search" className="text-muted" />
            <input
              autoFocus
              role="combobox"
              aria-expanded
              aria-controls="command-results"
              aria-activedescendant={
                results[active] ? `command-${results[active]!.id}` : undefined
              }
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              placeholder="Search pages, workflows, playbooks"
              className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            />
            <kbd className="rounded-sm border border-line px-1.5 font-mono text-xs text-muted">
              Esc
            </kbd>
          </div>
          <ul
            id="command-results"
            role="listbox"
            className="max-h-[50dvh] overflow-y-auto p-2"
          >
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted">
                Nothing matches &ldquo;{query}&rdquo;
              </li>
            )}
            {results.map((item, index) => (
              <li
                key={item.id}
                id={`command-${item.id}`}
                role="option"
                aria-selected={index === active}
                onPointerEnter={() => setActive(index)}
                onClick={() => choose(index)}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 text-sm",
                  index === active && "bg-sunken",
                )}
              >
                <Icon name={item.icon} size={18} className="text-muted" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-xs text-muted">{item.group}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </dialog>
  );
}
