"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getPlaybook } from "@/data/playbooks";
import { seedWorkflows } from "@/data/workspace";
import type { Run, Workflow } from "@/lib/engine/types";
import { workflowFromPlaybook } from "@/lib/workflow-factory";
import { seedRuns } from "./seed-runs";
import { safeStorage } from "./storage";
import { isRun, isWorkflow } from "./validate";

const maxRuns = 600;

export type WorkspaceSettings = { hourlyRate: number; seenTour: boolean };

type WorkspaceState = {
  workflows: Workflow[];
  runs: Run[];
  settings: WorkspaceSettings;
  seeded: boolean;
  seed: () => void;
  resetDemo: () => void;
  saveWorkflow: (workflow: Workflow) => void;
  createFromPlaybook: (slug: string) => string | null;
  addWorkflow: (workflow: Workflow) => void;
  duplicateWorkflow: (id: string) => string | null;
  deleteWorkflow: (id: string) => void;
  setEnabled: (id: string, enabled: boolean) => void;
  addRuns: (runs: Run[]) => void;
  updateSettings: (settings: Partial<WorkspaceSettings>) => void;
};

const defaultSettings: WorkspaceSettings = { hourlyRate: 45, seenTour: false };

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function freshWorkspace() {
  const now = Date.now();
  const workflows = seedWorkflows(now);
  return { workflows, runs: seedRuns(workflows, now), seeded: true };
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workflows: [],
      runs: [],
      settings: defaultSettings,
      seeded: false,
      seed: () => {
        if (!get().seeded) set(freshWorkspace());
      },
      resetDemo: () => set({ ...freshWorkspace(), settings: defaultSettings }),
      saveWorkflow: (workflow) =>
        set({
          workflows: get().workflows.map((item) =>
            item.id === workflow.id
              ? { ...workflow, updatedAt: new Date().toISOString() }
              : item,
          ),
        }),
      createFromPlaybook: (slug) => {
        const playbook = getPlaybook(slug);
        if (!playbook) return null;
        const workflow = workflowFromPlaybook(
          playbook,
          newId("wf"),
          new Date().toISOString(),
        );
        set({
          workflows: [{ ...workflow, enabled: false }, ...get().workflows],
        });
        return workflow.id;
      },
      addWorkflow: (workflow) =>
        set({ workflows: [workflow, ...get().workflows] }),
      duplicateWorkflow: (id) => {
        const source = get().workflows.find((item) => item.id === id);
        if (!source) return null;
        const now = new Date().toISOString();
        const copy = {
          ...structuredClone(source),
          id: newId("wf"),
          name: `${source.name} (copy)`,
          enabled: false,
          createdAt: now,
          updatedAt: now,
        };
        set({ workflows: [copy, ...get().workflows] });
        return copy.id;
      },
      deleteWorkflow: (id) =>
        set({
          workflows: get().workflows.filter((item) => item.id !== id),
          runs: get().runs.filter((run) => run.workflowId !== id),
        }),
      setEnabled: (id, enabled) =>
        set({
          workflows: get().workflows.map((item) =>
            item.id === id ? { ...item, enabled } : item,
          ),
        }),
      addRuns: (runs) =>
        set({
          runs: [...runs, ...get().runs]
            .sort((a, b) => b.startedAt - a.startedAt)
            .slice(0, maxRuns),
        }),
      updateSettings: (settings) =>
        set({ settings: { ...get().settings, ...settings } }),
    }),
    {
      name: "unbusy-workspace",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ workflows, runs, settings, seeded }) => ({
        workflows,
        runs,
        settings,
        seeded,
      }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<WorkspaceState>;
        const workflows = Array.isArray(stored.workflows)
          ? stored.workflows.filter(isWorkflow)
          : [];
        const runs = Array.isArray(stored.runs)
          ? stored.runs.filter(isRun)
          : [];
        const hourlyRate = Number(stored.settings?.hourlyRate);
        return {
          ...current,
          workflows,
          runs,
          seeded: Boolean(stored.seeded) && workflows.length > 0,
          settings: {
            hourlyRate:
              Number.isFinite(hourlyRate) && hourlyRate > 0
                ? hourlyRate
                : defaultSettings.hourlyRate,
            seenTour: Boolean(stored.settings?.seenTour),
          },
        };
      },
    },
  ),
);
