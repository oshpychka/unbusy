"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { toast } from "@/components/ui/Toaster";
import { PlaybookSteps } from "@/components/site/PlaybookSteps";
import { CanvasViewport } from "@/components/workflow/CanvasViewport";
import {
  diagramSize,
  WorkflowDiagram,
} from "@/components/workflow/WorkflowDiagram";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import type { WorkflowDraft } from "@/lib/engine/validate";
import { useWorkspace } from "@/lib/store/workspace";
import { decodeShare } from "@/lib/workflow-io";
import { PageHeader } from "./PageHeader";

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; draft: WorkflowDraft };

export function SharedWorkflow() {
  const ready = useWorkspaceReady();
  const router = useRouter();
  const addDraft = useWorkspace((state) => state.addDraft);
  const canvas = useMediaQuery("(min-width: 768px)", true);
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    decodeShare(window.location.hash.slice(1)).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { status: "ready", draft: result.value }
          : { status: "error", error: result.error },
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading" || !ready)
    return <Skeleton className="h-[60dvh] w-full" />;
  if (state.status === "error") {
    return (
      <EmptyState
        icon="share"
        title="This link does not open a workflow"
        text={`${state.error}. Ask for a fresh link, or start from a playbook.`}
        action={
          <Link href="/app/playbooks" className="text-primary underline">
            Browse playbooks
          </Link>
        }
      />
    );
  }

  const { draft } = state;
  const size = diagramSize(draft.steps);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={draft.name}
        description="Shared with you. This is a read-only preview until you copy it."
        actions={
          <Button
            icon="copy"
            onClick={() => {
              const id = addDraft(draft);
              toast(
                "Copied to your workspace. It starts turned off.",
                "success",
              );
              router.push(`/app/workflows/${id}`);
            }}
          >
            Copy to my workspace
          </Button>
        }
      />
      {draft.description && (
        <p className="max-w-prose text-muted">{draft.description}</p>
      )}
      {canvas ? (
        <div className="h-[560px] overflow-hidden rounded-md border border-line">
          <CanvasViewport
            contentWidth={size.width}
            contentHeight={size.height}
            fitKey="shared"
          >
            <WorkflowDiagram trigger={draft.trigger} steps={draft.steps} />
          </CanvasViewport>
        </div>
      ) : (
        <PlaybookSteps trigger={draft.trigger} steps={draft.steps} />
      )}
    </div>
  );
}
