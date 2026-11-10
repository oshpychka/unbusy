"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRunPlayback } from "@/hooks/useRunPlayback";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { createStep, insertStep, type Slot } from "@/lib/engine/edit";
import { execute } from "@/lib/engine/executor";
import { samplePayload } from "@/lib/engine/samples";
import type { AppId, DataRecord, StepType } from "@/lib/engine/types";
import { useEditor } from "@/lib/store/editor";
import { useWorkspace } from "@/lib/store/workspace";
import { AddStepDialog } from "./AddStepDialog";
import { EditorHeader } from "./EditorHeader";
import { CanvasViewport } from "./CanvasViewport";
import { StepPanel } from "./panel/StepPanel";
import { StepList } from "./StepList";
import { parsePayload, TestRunPanel } from "./TestRunPanel";
import { diagramSize, WorkflowDiagram } from "./WorkflowDiagram";

type Tab = "configure" | "test";

export function WorkflowEditor({ id }: { id: string }) {
  const ready = useWorkspaceReady();
  const workflow = useWorkspace((state) =>
    state.workflows.find((item) => item.id === id),
  );
  const {
    open,
    select,
    change,
    undo,
    redo,
    selected,
    testRun,
    setTestRun,
    past,
    future,
  } = useEditor();
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const canvas = useMediaQuery("(min-width: 768px)", true);
  const [tab, setTab] = useState<Tab>("configure");
  const [sheet, setSheet] = useState<Tab | null>(null);
  const [insertAt, setInsertAt] = useState<Slot | null>(null);
  const [sampleSeed, setSampleSeed] = useState(1);
  const [payloadText, setPayloadText] = useState<string | null>(null);
  const [openedAt] = useState(() => Date.now());
  const playback = useRunPlayback(testRun);
  const trigger = workflow?.trigger;

  useEffect(() => open(id), [open, id]);

  const defaultPayload = useMemo(
    () =>
      trigger
        ? JSON.stringify(samplePayload(trigger, sampleSeed, openedAt), null, 2)
        : "{}",
    [trigger, sampleSeed, openedAt],
  );
  const text = payloadText ?? defaultPayload;
  const payload = parsePayload(text);

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
    if (!workflow) return;
    if (!wide) setSheet(null);
    setTestRun(
      execute(workflow, data, {
        seed: Date.now() % 100000,
        startedAt: Date.now(),
        runId: `test_${Date.now().toString(36)}`,
        failureRate: 0,
      }),
    );
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
        onPayloadText={setPayloadText}
        onNewSample={() => {
          setPayloadText(null);
          setSampleSeed((seed) => seed + 1);
        }}
        onRun={runTest}
        run={testRun}
        done={playback.done}
      />
    ) : (
      <StepPanel
        workflow={workflow}
        selected={selected}
        payload={payload}
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
                  onSelect={choose}
                  onInsert={setInsertAt}
                />
              </CanvasViewport>
            </div>
          ) : (
            <div className="dot-grid px-4 py-5">
              {testRun && playback.done && (
                <div
                  role="status"
                  className="mb-4 flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2 text-sm"
                >
                  <span
                    className={
                      testRun.status === "failed"
                        ? "text-danger"
                        : "text-success"
                    }
                  >
                    {testRun.status === "success"
                      ? "Test run succeeded"
                      : testRun.status === "failed"
                        ? "Test run failed"
                        : "Stopped by a filter"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSheet("test")}
                  >
                    Details
                  </Button>
                </div>
              )}
              <StepList
                trigger={workflow.trigger}
                steps={workflow.steps}
                path={playback.path}
                activeStep={playback.activeStep}
                selected={selected}
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
      <AddStepDialog
        open={insertAt !== null}
        onClose={() => setInsertAt(null)}
        onPick={addStep}
      />
    </div>
  );
}
