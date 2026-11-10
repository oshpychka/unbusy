import type { Metadata } from "next";
import { Suspense } from "react";
import { RunsList } from "@/components/app/RunsList";

export const metadata: Metadata = { title: "Runs" };

export default function RunsPage() {
  return (
    <Suspense>
      <RunsList />
    </Suspense>
  );
}
