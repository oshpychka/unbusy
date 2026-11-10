"use client";

import { useEffect } from "react";

type Shortcuts = {
  undo: () => void;
  redo: () => void;
  remove: () => void;
  duplicate: () => void;
  deselect: () => void;
  test: () => void;
};

function isEditable(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return Boolean(
    element?.closest(
      "input, textarea, select, [contenteditable=true], [role=combobox], dialog",
    ),
  );
}

export function useEditorShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditable(event.target)) return;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (mod && key === "z") shortcuts[event.shiftKey ? "redo" : "undo"]();
      else if (mod && key === "y") shortcuts.redo();
      else if (mod && key === "d") shortcuts.duplicate();
      else if (mod && key === "enter") shortcuts.test();
      else if (!mod && (key === "delete" || key === "backspace"))
        shortcuts.remove();
      else if (key === "escape") shortcuts.deselect();
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}

export const editorShortcutList = [
  ["Undo", "Ctrl or Cmd + Z"],
  ["Redo", "Ctrl or Cmd + Shift + Z"],
  ["Duplicate the selected step", "Ctrl or Cmd + D"],
  ["Delete the selected step", "Delete or Backspace"],
  ["Run a test", "Ctrl or Cmd + Enter"],
  ["Clear the selection", "Esc"],
  ["Search pages, workflows and actions", "Ctrl or Cmd + K"],
] as const;
