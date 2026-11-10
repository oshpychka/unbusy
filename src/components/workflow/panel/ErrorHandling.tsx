"use client";

import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import type { ActionStep, Workflow } from "@/lib/engine/types";
import { PanelSection } from "./PanelSection";

type Policy = "default" | "stop" | "continue" | "fallback";

type ErrorHandlingProps = {
  step: ActionStep;
  settings: Workflow["settings"];
  onChange: (step: ActionStep) => void;
};

export function ErrorHandling({
  step,
  settings,
  onChange,
}: ErrorHandlingProps) {
  const policy: Policy = step.onError ?? "default";
  const retries = step.retry ? String(step.retry.attempts) : "default";
  const defaultLabel =
    settings.onError === "stop" ? "stop the run" : "skip and continue";

  return (
    <PanelSection title="If this step fails">
      <Field
        id={`${step.id}-on-error`}
        label="Then"
        hint="Temporary errors are retried first. Permanent ones, like a bad phone number, go straight here."
      >
        <Select<Policy>
          id={`${step.id}-on-error`}
          value={policy}
          options={[
            { value: "default", label: `Workflow default (${defaultLabel})` },
            { value: "stop", label: "Stop the run" },
            { value: "continue", label: "Skip this step and continue" },
            {
              value: "fallback",
              label: "Run an error path",
              hint: "Adds an If it fails branch on the canvas",
            },
          ]}
          onChange={(value) => {
            if (value === "default") onChange({ ...step, onError: undefined });
            else
              onChange({
                ...step,
                onError: value,
                fallback:
                  value === "fallback" ? (step.fallback ?? []) : step.fallback,
              });
          }}
        />
      </Field>
      <Field id={`${step.id}-retries`} label="Retries">
        <Select
          id={`${step.id}-retries`}
          value={retries}
          options={[
            {
              value: "default",
              label: `Workflow default (${settings.retry.attempts})`,
            },
            ...["0", "1", "2", "3", "5"].map((value) => ({
              value,
              label:
                value === "0"
                  ? "No retries"
                  : `${value} retries, waiting longer each time`,
            })),
          ]}
          onChange={(value) =>
            onChange({
              ...step,
              retry:
                value === "default"
                  ? undefined
                  : {
                      attempts: Number(value),
                      backoffMs: settings.retry.backoffMs,
                    },
            })
          }
        />
      </Field>
    </PanelSection>
  );
}
