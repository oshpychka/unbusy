import type { Metadata } from "next";
import { PageHeader } from "@/components/app/PageHeader";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <PageHeader
      title="Analytics"
      description="Hours and dollars your workflows saved."
    />
  );
}
