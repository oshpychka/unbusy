"use client";

import { useEffect, useState } from "react";
import { CanvasViewport } from "@/components/workflow/CanvasViewport";
import {
  diagramSize,
  WorkflowDiagram,
} from "@/components/workflow/WorkflowDiagram";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { stepTitle } from "@/lib/engine/describe";
import { findStep } from "@/lib/engine/edit";
import type { Run, TraceEntry, Workflow } from "@/lib/engine/types";
import { runPath } from "@/lib/run-path";
import { EntryDetails } from "./EntryDetails";
import { Timeline } from "./Timeline";

const stepMs = 800;

export function RunDebugger({
  run,
  workflow,
}: {
  run: Run;
  workflow?: Workflow;
}) {
  const canvas = useMediaQuery("(min-width: 768px)", true);
  const [cursor, setCursor] = useState(() =>
    Math.max(
      0,
      run.trace.findIndex((entry) => entry.status === "failed"),
    ),
  );
  const [playing, setPlaying] = useState(false);
  const [reveal, setReveal] = useState(false);
  const entry = run.trace[cursor];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setCursor((current) => {
        if (current >= run.trace.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [playing, run.trace.length]);

  function titleOf(item: TraceEntry) {
    const step = workflow ? findStep(workflow.steps, item.stepId) : null;
    const loop = item.path.match(/\[(\d+)\]/)?.[1];
    const base = step ? stepTitle(step) : item.stepId;
    return loop === undefined ? base : `${base}, item ${Number(loop) + 1}`;
  }

  if (!entry)
    return <p className="text-sm text-muted">This run has no steps.</p>;
  const size = workflow ? diagramSize(workflow.steps) : null;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      {workflow && size && canvas && (
        <div className="h-[600px] overflow-hidden rounded-md border border-line">
          <CanvasViewport
            contentWidth={size.width}
            contentHeight={size.height}
            fitKey={run.id}
          >
            <WorkflowDiagram
              trigger={workflow.trigger}
              steps={workflow.steps}
              path={runPath(run.trace.slice(0, cursor + 1))}
              activeStep={entry.stepId}
            />
          </CanvasViewport>
        </div>
      )}
      <section
        aria-label="Run debugger"
        className="flex min-w-0 flex-col gap-5 rounded-md border border-line bg-surface p-4"
      >
        <Timeline
          trace={run.trace}
          cursor={cursor}
          playing={playing}
          titleOf={titleOf}
          onCursor={(index) => {
            setPlaying(false);
            setCursor(Math.min(run.trace.length - 1, Math.max(0, index)));
          }}
          onPlay={() => {
            if (playing) return setPlaying(false);
            setCursor(0);
            setPlaying(true);
          }}
        />
        <EntryDetails
          entry={entry}
          title={titleOf(entry)}
          runStart={run.startedAt}
          workflow={workflow}
          reveal={reveal}
          onReveal={setReveal}
        />
      </section>
    </div>
  );
}
