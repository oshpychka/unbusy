import type { Metadata } from "next";
import { RunDetail } from "@/components/app/RunDetail";

export const metadata: Metadata = { title: "Run details" };

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RunDetail id={id} />;
}
