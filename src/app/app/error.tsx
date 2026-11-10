"use client";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useWorkspace } from "@/lib/store/workspace";

export default function AppError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const resetDemo = useWorkspace((state) => state.resetDemo);
  return (
    <ErrorState
      reset={reset}
      home="/app"
      homeLabel="Back to the overview"
      extra={
        <p className="text-sm text-muted">
          Saved demo data might be damaged.{" "}
          <Button
            variant="ghost"
            size="sm"
            className="text-primary underline"
            onClick={() => {
              resetDemo();
              reset();
            }}
          >
            Reset the demo
          </Button>
        </p>
      }
    />
  );
}
