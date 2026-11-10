import type { Metadata } from "next";
import { SharedWorkflow } from "@/components/app/SharedWorkflow";

export const metadata: Metadata = { title: "Shared workflow" };

export default function SharedPage() {
  return <SharedWorkflow />;
}
