"use client";

import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { apps } from "@/data/apps";
import { triggerEventOf } from "@/lib/engine/describe";
import type { AppId, Trigger } from "@/lib/engine/types";
import { InputFieldControl } from "./InputFieldControl";
import { PanelSection } from "./PanelSection";
import { ScheduleEditor } from "./ScheduleEditor";

const triggerOptions = apps.flatMap((app) =>
  app.events.map((event) => ({
    value: `${app.id}.${event.id}`,
    label: event.label,
    hint: app.name,
  })),
);

export function TriggerEditor({
  trigger,
  onChange,
}: {
  trigger: Trigger;
  onChange: (trigger: Trigger) => void;
}) {
  const event = triggerEventOf(trigger);

  return (
    <>
      <PanelSection title="When this happens">
        <Field id="trigger-event" label="Trigger" hint={event?.description}>
          <Select
            id="trigger-event"
            value={`${trigger.app}.${trigger.event}`}
            options={triggerOptions}
            onChange={(value) => {
              const [app, id] = value.split(".") as [AppId, string];
              onChange({ app, event: id, config: {} });
            }}
          />
        </Field>
      </PanelSection>
      {trigger.app === "schedule" && (
        <ScheduleEditor
          rule={trigger.config.rule ?? ""}
          onChange={(rule) =>
            onChange({ ...trigger, config: { ...trigger.config, rule } })
          }
        />
      )}
      {event && event.config.length > 0 && trigger.app !== "schedule" && (
        <PanelSection title="Settings">
          {event.config.map((field) => (
            <InputFieldControl
              key={field.key}
              id={`trigger-${field.key}`}
              field={field}
              value={trigger.config[field.key] ?? ""}
              onChange={(value) =>
                onChange({
                  ...trigger,
                  config: { ...trigger.config, [field.key]: value },
                })
              }
            />
          ))}
        </PanelSection>
      )}
      {event && (
        <PanelSection title="Data it provides">
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {event.outputs.map((field) => (
              <li
                key={field.path}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <span>{field.label}</span>
                <span className="truncate font-mono text-xs text-muted">{`{{trigger.${field.path}}}`}</span>
              </li>
            ))}
          </ul>
        </PanelSection>
      )}
    </>
  );
}
