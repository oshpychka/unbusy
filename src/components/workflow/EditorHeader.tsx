"use client";

import Link from "next/link";
import { Button, IconButton } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Choice";
import { Icon } from "@/components/ui/Icon";
import type { Workflow } from "@/lib/engine/types";
import { useWorkspace } from "@/lib/store/workspace";

type EditorHeaderProps = {
  workflow: Workflow;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSettings: () => void;
  onTest: () => void;
};

export function EditorHeader({
  workflow,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSettings,
  onTest,
}: EditorHeaderProps) {
  const setEnabled = useWorkspace((state) => state.setEnabled);

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface px-4 py-3 sm:px-6">
      <div className="flex min-w-0 basis-full items-center gap-3 md:flex-1 md:basis-0">
        <Link
          href="/app/workflows"
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm text-muted hover:text-text"
        >
          <Icon name="chevronRight" size={16} className="rotate-180" />
          Workflows
        </Link>
        <h1 className="min-w-0 truncate text-lg font-bold">
          {workflow.name || "Untitled workflow"}
        </h1>
      </div>
      <Switch
        checked={workflow.enabled}
        onChange={(value) => setEnabled(workflow.id, value)}
        label={workflow.enabled ? "On" : "Off"}
      />
      <div className="ml-auto flex items-center md:ml-0">
        <IconButton
          icon="undo"
          label="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        />
        <IconButton
          icon="redo"
          label="Redo"
          disabled={!canRedo}
          onClick={onRedo}
        />
        <IconButton
          icon="settings"
          label="Workflow settings"
          onClick={onSettings}
        />
      </div>
      <Button icon="play" onClick={onTest}>
        Test run
      </Button>
    </header>
  );
}
