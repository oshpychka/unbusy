"use client";

import { ErrorState } from "@/components/ui/ErrorState";

export default function SiteError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="px-4">
      <ErrorState reset={reset} home="/" homeLabel="Go to the home page" />
    </div>
  );
}
