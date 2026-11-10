"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { toast } from "@/components/ui/Toaster";
import { useThemePreference } from "@/hooks/useThemePreference";
import { useWorkspace } from "@/lib/store/workspace";
import type { ThemePreference } from "@/lib/theme";
import { PageHeader } from "./PageHeader";

export function SettingsForm() {
  const [theme, setTheme] = useThemePreference();
  const { settings, updateSettings, resetDemo, workflows, runs } =
    useWorkspace();
  const [rate, setRate] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const rateText = rate ?? String(settings.hourlyRate);
  const rateValue = Number(rateText);
  const rateError =
    !Number.isFinite(rateValue) || rateValue <= 0 || rateValue > 1000
      ? "Enter an amount between 1 and 1000"
      : undefined;

  function exportData() {
    const blob = new Blob([JSON.stringify({ workflows, runs }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unbusy-workspace.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Theme, savings rate and demo data."
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <Segmented<ThemePreference>
          label="Theme"
          value={theme}
          onChange={setTheme}
          className="self-start"
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Savings</h2>
        <form
          className="flex flex-wrap items-start gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (rateError) return;
            updateSettings({ hourlyRate: rateValue });
            setRate(null);
            toast("Hourly rate saved", "success");
          }}
        >
          <Field
            id="hourly-rate"
            label="Cost of an hour of manual work, USD"
            hint="Used to turn hours saved into dollars."
            error={rate !== null ? rateError : undefined}
            className="w-full sm:w-72"
          >
            <Input
              id="hourly-rate"
              inputMode="decimal"
              value={rateText}
              onChange={(event) => setRate(event.target.value)}
              aria-invalid={Boolean(rate !== null && rateError) || undefined}
              aria-describedby="hourly-rate-message"
            />
          </Field>
          <Button
            type="submit"
            variant="secondary"
            className="sm:mt-7"
            disabled={rate === null}
          >
            Save
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Demo data</h2>
        <p className="text-sm text-muted">
          Everything here lives in this browser only. Export it, or reset to the
          original sample workspace with a fresh month of runs.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon="download" onClick={exportData}>
            Export workspace
          </Button>
          <Button variant="danger" onClick={() => setConfirm(true)}>
            Reset demo
          </Button>
        </div>
      </section>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset the demo?"
        description="Your workflows, edits and run history in this browser will be replaced."
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetDemo();
              setConfirm(false);
              toast("Demo reset", "success");
            }}
          >
            Reset
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
