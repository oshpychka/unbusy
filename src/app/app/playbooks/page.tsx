import type { Metadata } from "next";
import { Suspense } from "react";
import { AppPlaybooks } from "@/components/app/AppPlaybooks";

export const metadata: Metadata = { title: "Playbooks" };

export default function PlaybooksPage() {
  return (
    <Suspense>
      <AppPlaybooks />
    </Suspense>
  );
}
