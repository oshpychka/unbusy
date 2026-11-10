import { Badge } from "@/components/ui/States";
import type { RunStatus as Status } from "@/lib/engine/types";

const labels: Record<Status, string> = {
  success: "Succeeded",
  failed: "Failed",
  filtered: "Stopped",
};
const tones = {
  success: "success",
  failed: "danger",
  filtered: "neutral",
} as const;

export function RunStatus({ status }: { status: Status }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
