import type { Metadata } from "next";
import { PageHeader } from "@/components/app/PageHeader";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PageHeader
      title="Settings"
      description="Theme, savings rate and demo data."
    />
  );
}
