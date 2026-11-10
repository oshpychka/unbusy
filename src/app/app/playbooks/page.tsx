import type { Metadata } from "next";
import { PageHeader } from "@/components/app/PageHeader";

export const metadata: Metadata = { title: "Playbooks" };

export default function PlaybooksPage() {
  return (
    <PageHeader
      title="Playbooks"
      description="Ready-made workflows you can copy and adjust."
    />
  );
}
