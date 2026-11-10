"use client";

import { Icon } from "@/components/ui/Icon";
import { branchKeys, listFor, type Slot } from "@/lib/engine/edit";
import type { Step, Trigger } from "@/lib/engine/types";
import type { RunPath } from "@/lib/run-path";
import { StepCard, type StepCardState } from "./StepCard";
import { stepMeta, triggerMeta } from "./step-meta";

type StepListProps = {
  trigger: Trigger;
  steps: Step[];
  path?: RunPath;
  activeStep?: string | null;
  selected: string | null;
  issues?: Map<string, "error" | "warning">;
  onSelect: (id: string) => void;
  onInsert: (slot: Slot) => void;
};

function branchLabel(step: Step, key: string) {
  if (step.type === "if") return key === "then" ? "If yes" : "If no";
  if (step.type === "switch")
    return key === "otherwise"
      ? "Otherwise"
      : `When ${step.cases.find((item) => item.id === key)?.label ?? ""}`;
  if (step.type === "loop") return "For each item";
  return "If it fails";
}

export function StepList(props: StepListProps) {
  const { trigger, selected, onSelect } = props;
  const meta = triggerMeta(trigger);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => onSelect("trigger")}
        aria-pressed={selected === "trigger"}
        aria-label={`Trigger: ${meta.title}`}
        className="h-[68px] rounded-md"
      >
        <StepCard
          {...meta}
          selected={selected === "trigger"}
          state={props.path?.steps.size ? "ok" : "idle"}
        />
      </button>
      <Branch {...props} list={props.steps} parentId={null} branch="root" />
    </div>
  );
}

type BranchProps = StepListProps & {
  list: Step[];
  parentId: string | null;
  branch: string;
};

function Branch(props: BranchProps) {
  const { list, parentId, branch, onInsert } = props;
  return (
    <>
      <InsertButton onClick={() => onInsert({ parentId, branch, index: 0 })} />
      {list.map((step, index) => (
        <div key={step.id} className="flex flex-col">
          <Row {...props} step={step} />
          <InsertButton
            onClick={() => onInsert({ parentId, branch, index: index + 1 })}
          />
        </div>
      ))}
    </>
  );
}

function Row(props: BranchProps & { step: Step }) {
  const { step, path, activeStep, selected, issues, onSelect } = props;
  const meta = stepMeta(step);
  const keys = branchKeys(step);

  let state: StepCardState = "idle";
  if (activeStep === step.id) state = "active";
  else if (path?.steps.size) {
    const status = path.steps.get(step.id);
    state = !status ? "skipped" : status === "failed" ? "failed" : "ok";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(step.id)}
        aria-pressed={selected === step.id}
        aria-label={`${meta.kicker}: ${meta.title}`}
        className="h-[68px] rounded-md"
      >
        <StepCard
          {...meta}
          state={state}
          selected={selected === step.id}
          issue={issues?.get(step.id)}
        />
      </button>
      {keys.map((key) => (
        <div key={key} className="mt-2 ml-3 border-l-2 border-line pl-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
            <Icon name="chevronRight" size={14} />
            {branchLabel(step, key)}
          </span>
          <Branch
            {...props}
            list={listFor(step, key) ?? []}
            parentId={step.id}
            branch={key}
          />
        </div>
      ))}
    </>
  );
}

function InsertButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add a step here"
      className="group relative flex h-11 items-center justify-center"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-1/2 w-px bg-line-strong"
      />
      <span className="relative grid size-7 place-items-center rounded-full border border-line-strong bg-surface text-muted group-hover:border-primary group-hover:text-primary">
        <Icon name="plus" size={14} />
      </span>
    </button>
  );
}
