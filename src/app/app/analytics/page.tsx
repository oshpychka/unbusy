import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@/components/app/Analytics";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <Suspense>
      <Analytics />
    </Suspense>
  );
}
