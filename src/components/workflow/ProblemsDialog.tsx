import { Dialog } from "@/components/ui/Dialog";
import { issueTitle, type Issue } from "@/lib/engine/lint";
import type { Workflow } from "@/lib/engine/types";
import { IssueList } from "./IssueList";

type ProblemsDialogProps = {
  workflow: Workflow;
  issues: Issue[];
  open: boolean;
  onClose: () => void;
  onPick: (target: string) => void;
};

export function ProblemsDialog({
  workflow,
  issues,
  open,
  onClose,
  onPick,
}: ProblemsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Problems"
      description="Errors must be fixed before the workflow can be turned on."
    >
      {issues.length ? (
        <IssueList
          issues={issues}
          titleOf={(target) => issueTitle(workflow, target)}
          onPick={onPick}
        />
      ) : (
        <p className="text-sm text-muted">No problems found.</p>
      )}
    </Dialog>
  );
}
