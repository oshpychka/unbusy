"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWorkflowShortcuts } from "@/hooks/useWorkflowShortcuts";
import { useRunPlayback } from "@/hooks/useRunPlayback";
import { useTestPayload } from "@/hooks/useTestPayload";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { createStep, insertStep, type Slot } from "@/lib/engine/edit";
import { issueMap } from "@/lib/engine/issue-map";
import { lintWorkflow } from "@/lib/engine/lint";
import type { AppId, DataRecord, StepType } from "@/lib/engine/types";
import { useEditor } from "@/lib/store/editor";
import { useWorkspace } from "@/lib/store/workspace";
import { AddStepDialog } from "./AddStepDialog";
import { BatchDialog } from "./BatchDialog";
import { EditorHeader } from "./EditorHeader";
import { EditorMenu } from "./EditorMenu";
import { CanvasViewport } from "./CanvasViewport";
import { StepPanel } from "./panel/StepPanel";
import { ProblemsDialog } from "./ProblemsDialog";
import { ShortcutsDialog } from "./ShortcutsDialog";
import { TestBanner } from "./TestBanner";
import { StepList } from "./StepList";
import { TestRunPanel } from "./TestRunPanel";
import { diagramSize, WorkflowDiagram } from "./WorkflowDiagram";

type Tab = "configure" | "test";

export function WorkflowEditor({ id }: { id: string }) {
  const ready = useWorkspaceReady();
  const workflow = useWorkspace((state) =>
    state.workflows.find((item) => item.id === id),
  );
  const { open, select, change, undo, redo, selected, testRun, past, future } =
    useEditor();
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const canvas = useMediaQuery("(min-width: 768px)", true);
  const [tab, setTab] = useState<Tab>("configure");
  const [sheet, setSheet] = useState<Tab | null>(null);
  const [insertAt, setInsertAt] = useState<Slot | null>(null);
  const playback = useRunPlayback(testRun);
  const trigger = workflow?.trigger;
  const [problemsOpen, setProblemsOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const startBatch = useEditor((state) => state.startBatch);
  const issues = useMemo(
    () => (workflow ? lintWorkflow(workflow) : []),
    [workflow],
  );
  const issuesByTarget = useMemo(() => issueMap(issues), [issues]);

  useEffect(() => open(id), [open, id]);

  const { text, payload, setText, newSample } = useTestPayload(trigger);

  const startTest = useEditor((state) => state.startTest);
  const testShortcut = useCallback(() => {
    setTab("test");
    if (payload) startTest(payload);
  }, [payload, startTest]);
  useWorkflowShortcuts(testShortcut);

  if (!ready) return <Skeleton className="h-[70dvh] w-full" />;
  if (!workflow) {
    return (
      <EmptyState
        icon="workflow"
        title="This workflow does not exist"
        text="It may have been deleted, or the demo was reset."
        action={
          <Link href="/app/workflows" className="text-primary underline">
            Back to workflows
          </Link>
        }
      />
    );
  }

  function choose(nextId: string | null) {
    select(nextId);
    setTab("configure");
    if (!wide) setSheet(nextId ? "configure" : null);
  }

  function openSettings() {
    select(null);
    setTab("configure");
    if (!wide) setSheet("configure");
  }

  function addStep(type: StepType, app?: AppId, operation?: string) {
    if (!insertAt) return;
    const step = createStep(type, app, operation);
    change((current) => ({
      ...current,
      steps: insertStep(current.steps, insertAt, step),
    }));
    setInsertAt(null);
    choose(step.id);
  }

  function runTest(data: DataRecord) {
    if (!wide) setSheet(null);
    startTest(data);
  }

  const size = diagramSize(workflow.steps);
  const panelTitle =
    tab === "test"
      ? "Test run"
      : selected === "trigger"
        ? "Trigger"
        : selected
          ? "Step"
          : "Workflow settings";

  const panel =
    tab === "test" ? (
      <TestRunPanel
        workflow={workflow}
        payloadText={text}
        onPayloadText={setText}
        onNewSample={newSample}
        onRun={runTest}
        run={testRun}
        done={playback.done}
        onBatch={() => {
          startBatch();
          setBatchOpen(true);
        }}
      />
    ) : (
      <StepPanel
        workflow={workflow}
        selected={selected}
        payload={payload}
        issues={issues.filter((issue) => issue.target === (selected ?? ""))}
        onChange={change}
        onSelect={choose}
      />
    );

  return (
    <div className="-mx-4 -mt-6 flex flex-col sm:-mx-6 md:-mx-8 md:-mt-8 md:h-[100dvh]">
      <EditorHeader
        workflow={workflow}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={undo}
        onRedo={redo}
        issues={issues}
        onProblems={() => setProblemsOpen(true)}
        menu={
          <EditorMenu
            workflow={workflow}
            onShortcuts={() => setShortcutsOpen(true)}
          />
        }
        onSettings={openSettings}
        onTest={() => {
          setTab("test");
          if (!wide) setSheet("test");
        }}
      />

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          {canvas ? (
            <div className="h-[calc(100dvh-4.5rem)] md:h-full">
              <CanvasViewport
                contentWidth={size.width}
                contentHeight={size.height}
                fitKey={workflow.id}
              >
                <WorkflowDiagram
                  trigger={workflow.trigger}
                  steps={workflow.steps}
                  path={playback.path}
                  activeStep={playback.activeStep}
                  selected={selected}
                  issues={issuesByTarget}
                  onSelect={choose}
                  onInsert={setInsertAt}
                />
              </CanvasViewport>
            </div>
          ) : (
            <div className="dot-grid px-4 py-5">
              {testRun && playback.done && (
                <TestBanner run={testRun} onDetails={() => setSheet("test")} />
              )}
              <StepList
                trigger={workflow.trigger}
                steps={workflow.steps}
                path={playback.path}
                activeStep={playback.activeStep}
                selected={selected}
                issues={issuesByTarget}
                onSelect={choose}
                onInsert={setInsertAt}
              />
            </div>
          )}
        </div>

        {wide && (
          <aside className="flex w-[400px] shrink-0 flex-col border-l border-line bg-surface">
            <div className="border-b border-line p-3">
              <Segmented
                label="Panel"
                value={tab}
                options={[
                  { value: "configure", label: "Configure" },
                  { value: "test", label: "Test run" },
                ]}
                onChange={setTab}
                className="w-full"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">{panel}</div>
          </aside>
        )}
      </div>

      {!wide && (
        <Dialog
          open={sheet !== null}
          onClose={() => setSheet(null)}
          title={panelTitle}
          variant="sheet"
        >
          {panel}
        </Dialog>
      )}
      <ProblemsDialog
        workflow={workflow}
        issues={issues}
        open={problemsOpen}
        onClose={() => setProblemsOpen(false)}
        onPick={(target) => {
          setProblemsOpen(false);
          choose(target);
        }}
      />
      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <BatchDialog
        workflow={workflow}
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
      />
      <AddStepDialog
        open={insertAt !== null}
        onClose={() => setInsertAt(null)}
        onPick={addStep}
      />
    </div>
  );
}
