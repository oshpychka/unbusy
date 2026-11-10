"use client";

import { create } from "zustand";
import type { Run, Workflow } from "@/lib/engine/types";
import { useWorkspace } from "./workspace";

const historyLimit = 50;

type EditorState = {
  workflowId: string | null;
  past: Workflow[];
  future: Workflow[];
  selected: string | null;
  testRun: Run | null;
  open: (workflowId: string) => void;
  select: (id: string | null) => void;
  change: (update: (workflow: Workflow) => Workflow) => void;
  undo: () => void;
  redo: () => void;
  setTestRun: (run: Run | null) => void;
};

function current(id: string | null) {
  return (
    useWorkspace.getState().workflows.find((workflow) => workflow.id === id) ??
    null
  );
}

export const useEditor = create<EditorState>((set, get) => ({
  workflowId: null,
  past: [],
  future: [],
  selected: null,
  testRun: null,
  open: (workflowId) => {
    if (get().workflowId === workflowId) return;
    set({ workflowId, past: [], future: [], selected: null, testRun: null });
  },
  select: (selected) => set({ selected }),
  change: (update) => {
    const workflow = current(get().workflowId);
    if (!workflow) return;
    const next = update(workflow);
    if (next === workflow) return;
    useWorkspace.getState().saveWorkflow(next);
    set({ past: [...get().past, workflow].slice(-historyLimit), future: [] });
  },
  undo: () => {
    const workflow = current(get().workflowId);
    const previous = get().past.at(-1);
    if (!workflow || !previous) return;
    useWorkspace.getState().saveWorkflow(previous);
    set({ past: get().past.slice(0, -1), future: [workflow, ...get().future] });
  },
  redo: () => {
    const workflow = current(get().workflowId);
    const next = get().future[0];
    if (!workflow || !next) return;
    useWorkspace.getState().saveWorkflow(next);
    set({ past: [...get().past, workflow], future: get().future.slice(1) });
  },
  setTestRun: (testRun) => set({ testRun }),
}));
