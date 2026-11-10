"use client";

import { Dialog } from "@/components/ui/Dialog";
import { Icon, type IconName } from "@/components/ui/Icon";
import { apps } from "@/data/apps";
import { stepTypeLabels } from "@/lib/engine/describe";
import type { AppId, StepType } from "@/lib/engine/types";

const logicSteps: {
  type: Exclude<StepType, "action">;
  icon: IconName;
  text: string;
}[] = [
  { type: "if", icon: "branch", text: "Split into Yes and No paths" },
  { type: "switch", icon: "branch", text: "Pick a path by value" },
  { type: "filter", icon: "filter", text: "Stop unless conditions match" },
  { type: "delay", icon: "timer", text: "Wait for a time or until a date" },
  { type: "transform", icon: "transform", text: "Create or reformat fields" },
  { type: "loop", icon: "loop", text: "Repeat steps for every item in a list" },
];

type AddStepDialogProps = {
  open: boolean;
  onClose: () => void;
  onPick: (type: StepType, app?: AppId, operation?: string) => void;
};

export function AddStepDialog({ open, onClose, onPick }: AddStepDialogProps) {
  const actionApps = apps.filter((app) => app.operations.length > 0);

  return (
    <Dialog open={open} onClose={onClose} title="Add a step" variant="sheet">
      <h3 className="font-sans text-sm font-semibold">Logic</h3>
      <ul className="mt-2 grid gap-1">
        {logicSteps.map((item) => (
          <li key={item.type}>
            <Option
              icon={item.icon}
              title={stepTypeLabels[item.type]}
              text={item.text}
              onClick={() => onPick(item.type)}
            />
          </li>
        ))}
      </ul>
      <h3 className="mt-6 font-sans text-sm font-semibold">Actions</h3>
      <ul className="mt-2 grid gap-1">
        {actionApps.flatMap((app) =>
          app.operations.map((operation) => (
            <li key={`${app.id}.${operation.id}`}>
              <Option
                icon={app.icon as IconName}
                title={operation.label}
                text={app.name}
                onClick={() => onPick("action", app.id, operation.id)}
              />
            </li>
          )),
        )}
      </ul>
    </Dialog>
  );
}

function Option({
  icon,
  title,
  text,
  onClick,
}: {
  icon: IconName;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 w-full items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-sunken"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-line bg-surface">
        <Icon name={icon} />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted">{text}</span>
      </span>
    </button>
  );
}
