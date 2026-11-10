"use client";

import { useMemo } from "react";
import { duplicateStep, removeStep } from "@/lib/engine/edit";
import { useEditor } from "@/lib/store/editor";
import { useEditorShortcuts } from "./useEditorShortcuts";

export function useWorkflowShortcuts(onTest: () => void) {
  const { undo, redo, selected, change, select } = useEditor();

  const shortcuts = useMemo(() => {
    const step = selected && selected !== "trigger" ? selected : null;
    return {
      undo,
      redo,
      remove: () => {
        if (!step) return;
        change((current) => ({
          ...current,
          steps: removeStep(current.steps, step),
        }));
        select(null);
      },
      duplicate: () => {
        if (step)
          change((current) => ({
            ...current,
            steps: duplicateStep(current.steps, step),
          }));
      },
      deselect: () => select(null),
      test: onTest,
    };
  }, [undo, redo, selected, change, select, onTest]);

  useEditorShortcuts(shortcuts);
}
