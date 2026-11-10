import type { Metadata } from "next";
import { PageHeader } from "@/components/app/PageHeader";

export const metadata: Metadata = { title: "Workflows" };

export default function WorkflowsPage() {
  return (
    <PageHeader
      title="Workflows"
      description="Automations in this workspace."
    />
  );
}
