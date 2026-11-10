import type { Metadata } from "next";
import { PageHeader } from "@/components/app/PageHeader";

export const metadata: Metadata = { title: "Runs" };

export default function RunsPage() {
  return (
    <PageHeader title="Runs" description="Every run from the last 30 days." />
  );
}
