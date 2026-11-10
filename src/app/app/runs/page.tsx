import type { Metadata } from "next";
import { RunsList } from "@/components/app/RunsList";

export const metadata: Metadata = { title: "Runs" };

export default function RunsPage() {
  return <RunsList />;
}
