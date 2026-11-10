import { getApp } from "@/data/apps";
import { stepSubtitle, stepTitle, triggerEventOf } from "@/lib/engine/describe";
import { branchKeys, listFor } from "@/lib/engine/edit";
import type { Step, Trigger } from "@/lib/engine/types";

function branchName(step: Step, key: string) {
  if (step.type === "if") return key === "then" ? "If yes" : "If no";
  if (step.type === "switch")
    return key === "otherwise"
      ? "Otherwise"
      : `When ${step.cases.find((item) => item.id === key)?.label}`;
  return "For each item";
}

function StepItems({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step) => {
        const keys = branchKeys(step).filter(
          (key) => !(step.type === "action" && key === "fallback"),
        );
        return (
          <li key={step.id}>
            <p className="font-medium">{stepTitle(step)}</p>
            <p className="text-sm text-muted">{stepSubtitle(step)}</p>
            {keys.map((key) => {
              const list = listFor(step, key) ?? [];
              return (
                <div key={key} className="mt-3 border-l-2 border-line pl-4">
                  <p className="mb-2 text-sm font-medium text-muted">
                    {branchName(step, key)}
                  </p>
                  {list.length ? (
                    <StepItems steps={list} />
                  ) : (
                    <p className="text-sm text-muted">Nothing happens.</p>
                  )}
                </div>
              );
            })}
          </li>
        );
      })}
    </ol>
  );
}

export function PlaybookSteps({
  trigger,
  steps,
}: {
  trigger: Trigger;
  steps: Step[];
}) {
  const event = triggerEventOf(trigger);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-medium">Starts when: {event?.label}</p>
        <p className="text-sm text-muted">
          {getApp(trigger.app).name}. {event?.description}
        </p>
      </div>
      <StepItems steps={steps} />
    </div>
  );
}
