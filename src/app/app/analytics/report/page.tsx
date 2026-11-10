import type { Metadata } from "next";
import { RoiReport } from "@/components/app/RoiReport";

export const metadata: Metadata = { title: "Automation report" };

export default function ReportPage() {
  return <RoiReport />;
}
