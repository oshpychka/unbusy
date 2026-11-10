import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Unbusy: hand off the busywork";

export default function Image() {
  return ogImage(
    "Hand off the busywork.",
    "Workflow automation for small teams",
  );
}
