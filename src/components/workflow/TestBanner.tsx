import { Button } from "@/components/ui/Button";
import type { Run } from "@/lib/engine/types";

const messages = {
  success: "Test run succeeded",
  failed: "Test run failed",
  filtered: "Stopped by a filter",
};

export function TestBanner({
  run,
  onDetails,
}: {
  run: Run;
  onDetails: () => void;
}) {
  return (
    <div
      role="status"
      className="mb-4 flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2 text-sm"
    >
      <span
        className={run.status === "failed" ? "text-danger" : "text-success"}
      >
        {messages[run.status]}
      </span>
      <Button variant="ghost" size="sm" onClick={onDetails}>
        Details
      </Button>
    </div>
  );
}
