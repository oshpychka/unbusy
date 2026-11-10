import type { Metadata } from "next";
import { WorkflowsList } from "@/components/app/WorkflowsList";

export const metadata: Metadata = { title: "Workflows" };

export default function WorkflowsPage() {
  return <WorkflowsList />;
}
