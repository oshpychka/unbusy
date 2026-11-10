"use client";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/States";
import type { DataRecord, Run, Workflow } from "@/lib/engine/types";
import { formatDuration } from "@/lib/format";
import { TraceList } from "./TraceList";

type TestRunPanelProps = {
  workflow: Workflow;
  payloadText: string;
  onPayloadText: (text: string) => void;
  onNewSample: () => void;
  onRun: (payload: DataRecord) => void;
  run: Run | null;
  done: boolean;
};

export function parsePayload(text: string): DataRecord | null {
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : null;
  } catch {
    return null;
  }
}

export function TestRunPanel({
  workflow,
  payloadText,
  onPayloadText,
  onNewSample,
  onRun,
  run,
  done,
}: TestRunPanelProps) {
  const payload = parsePayload(payloadText);

  return (
    <div className="flex flex-col gap-4">
      <Field
        id="test-payload"
        label="Sample trigger data"
        hint="Edit any value to see how the workflow reacts."
        error={payload ? undefined : "This is not valid JSON"}
      >
        <Textarea
          id="test-payload"
          mono
          value={payloadText}
          onChange={(event) => onPayloadText(event.target.value)}
          className="min-h-48"
          aria-invalid={!payload || undefined}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button
          icon="play"
          disabled={!payload}
          onClick={() => payload && onRun(payload)}
        >
          Run test
        </Button>
        <Button variant="secondary" onClick={onNewSample}>
          New sample
        </Button>
      </div>

      <div aria-live="polite">
        {run && done && (
          <div className="flex flex-col gap-3 border-t border-line pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                tone={
                  run.status === "success"
                    ? "success"
                    : run.status === "failed"
                      ? "danger"
                      : "warning"
                }
              >
                {run.status === "success"
                  ? "Succeeded"
                  : run.status === "failed"
                    ? "Failed"
                    : "Stopped by filter"}
              </Badge>
              <span className="text-sm text-muted">
                {run.trace.length} steps,{" "}
                {formatDuration(run.finishedAt - run.startedAt)} of workflow
                time
              </span>
            </div>
            {run.error && <p className="text-sm text-danger">{run.error}</p>}
            <TraceList workflow={workflow} run={run} />
          </div>
        )}
      </div>
    </div>
  );
}
