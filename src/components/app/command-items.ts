import type { IconName } from "@/components/ui/Icon";
import { playbooks } from "@/data/playbooks";
import type { Workflow } from "@/lib/engine/types";
import { appNav, settingsNav } from "./app-nav";

export type CommandItem = {
  id: string;
  label: string;
  group: string;
  icon: IconName;
  run: () => void;
  keywords?: string;
};

type Actions = {
  go: (href: string) => void;
  newWorkflow: () => void;
  usePlaybook: (slug: string) => void;
  toggleTheme: () => void;
};

export function commandItems(
  workflows: Workflow[],
  actions: Actions,
): CommandItem[] {
  return [
    {
      id: "new",
      label: "New workflow",
      group: "Actions",
      icon: "plus",
      run: actions.newWorkflow,
      keywords: "create blank",
    },
    {
      id: "theme",
      label: "Switch theme",
      group: "Actions",
      icon: "moon",
      run: actions.toggleTheme,
      keywords: "dark light mode",
    },
    ...[...appNav, settingsNav].map((item) => ({
      id: `page-${item.href}`,
      label: item.label,
      group: "Go to",
      icon: item.icon,
      run: () => actions.go(item.href),
    })),
    ...workflows.map((workflow) => ({
      id: `wf-${workflow.id}`,
      label: workflow.name,
      group: "Workflows",
      icon: "workflow" as const,
      run: () => actions.go(`/app/workflows/${workflow.id}`),
      keywords: workflow.description,
    })),
    ...playbooks.map((playbook) => ({
      id: `pb-${playbook.slug}`,
      label: `Use playbook: ${playbook.title}`,
      group: "Playbooks",
      icon: "book" as const,
      run: () => actions.usePlaybook(playbook.slug),
      keywords: playbook.summary,
    })),
  ];
}

export function filterCommands(items: CommandItem[], query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0)
    return items.filter((item) => item.group !== "Playbooks");
  return items.filter((item) => {
    const haystack =
      `${item.label} ${item.group} ${item.keywords ?? ""}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
