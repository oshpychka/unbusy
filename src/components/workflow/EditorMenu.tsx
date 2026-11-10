"use client";

import { useRouter } from "next/navigation";
import { Menu } from "@/components/ui/Menu";
import { toast } from "@/components/ui/Toaster";
import type { Workflow } from "@/lib/engine/types";
import { downloadText, slugify } from "@/lib/download";
import { useWorkspace } from "@/lib/store/workspace";
import { encodeShare, serializeWorkflow } from "@/lib/workflow-io";

export function EditorMenu({
  workflow,
  onShortcuts,
}: {
  workflow: Workflow;
  onShortcuts: () => void;
}) {
  const router = useRouter();
  const duplicateWorkflow = useWorkspace((state) => state.duplicateWorkflow);

  return (
    <Menu
      label="More actions"
      items={[
        {
          label: "Copy share link",
          icon: "share",
          onSelect: async () => {
            try {
              const code = await encodeShare(workflow);
              await navigator.clipboard.writeText(
                `${window.location.origin}/app/shared#${code}`,
              );
              toast(
                "Link copied. Anyone with it can view and copy this workflow.",
                "success",
              );
            } catch {
              toast("Could not create the link", "danger");
            }
          },
        },
        {
          label: "Export as file",
          icon: "download",
          onSelect: () =>
            downloadText(
              `${slugify(workflow.name)}.json`,
              serializeWorkflow(workflow),
            ),
        },
        {
          label: "Duplicate",
          icon: "copy",
          onSelect: () => {
            const id = duplicateWorkflow(workflow.id);
            if (id) router.push(`/app/workflows/${id}`);
          },
        },
        { label: "Keyboard shortcuts", icon: "command", onSelect: onShortcuts },
      ]}
    />
  );
}
