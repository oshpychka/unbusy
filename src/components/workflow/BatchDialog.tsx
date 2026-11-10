"use client";

import { Dialog } from "@/components/ui/Dialog";
import { toast } from "@/components/ui/Toaster";
import { retryFailed } from "@/lib/engine/batch";
import type { Workflow } from "@/lib/engine/types";
import { useEditor } from "@/lib/store/editor";
import { useWorkspace } from "@/lib/store/workspace";
import { BatchResults } from "./BatchResults";

export function BatchDialog({
  workflow,
  open,
  onClose,
}: {
  workflow: Workflow;
  open: boolean;
  onClose: () => void;
}) {
  const batch = useEditor((state) => state.batch);
  const setBatch = useEditor((state) => state.setBatch);
  const addRuns = useWorkspace((state) => state.addRuns);

  return (
    <Dialog
      open={open && batch !== null}
      onClose={onClose}
      title="50 records, one workflow"
      description="Every record runs through the real engine with simulated apps."
      size="lg"
    >
      {batch && (
        <BatchResults
          workflow={workflow}
          runs={batch}
          onRetry={() => {
            const retried = retryFailed(
              workflow,
              batch,
              Date.now() % 1_000_000,
              Date.now(),
            );
            setBatch(retried);
            const left = retried.filter(
              (run) => run.status === "failed",
            ).length;
            toast(
              left ? `${left} still failing` : "All retries went through",
              left ? "danger" : "success",
            );
          }}
          onKeep={() => {
            addRuns(batch);
            toast(`${batch.length} runs saved to history`, "success");
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}
