import type { Metadata } from "next";
import { WorkflowEditor } from "@/components/workflow/WorkflowEditor";

export const metadata: Metadata = { title: "Workflow editor" };

export default async function WorkflowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkflowEditor id={id} />;
}
