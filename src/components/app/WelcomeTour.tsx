"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { useWorkspace } from "@/lib/store/workspace";

const steps = [
  {
    title: "Welcome to the demo",
    text: "This workspace has 8 workflows and a month of runs. All of it was produced by the engine running in your browser.",
  },
  {
    title: "Open a workflow",
    text: "Each workflow is a canvas. Click a step to edit it, type {{ to insert data, then press Test run.",
    link: {
      href: "/app/workflows/wf_invoices",
      label: "Open Chase unpaid invoices",
    },
  },
  {
    title: "Debug any run",
    text: "Every run keeps the input and output of each step. Scrub through a failed one and replay it.",
    link: { href: "/app/runs?status=failed", label: "See failed runs" },
  },
  {
    title: "Try 50 records at once",
    text: "In Test run, Run 50 records shows where each record goes and what rate limits do to a busy hour.",
  },
];

export function WelcomeTour() {
  const ready = useWorkspaceReady();
  const seen = useWorkspace((state) => state.settings.seenTour);
  const updateSettings = useWorkspace((state) => state.updateSettings);
  const [index, setIndex] = useState(0);
  const pathname = usePathname();

  if (!ready || seen || pathname !== "/app") return null;
  const step = steps[index]!;
  const last = index === steps.length - 1;
  const finish = () => updateSettings({ seenTour: true });

  return (
    <section
      role="dialog"
      aria-labelledby="tour-title"
      aria-describedby="tour-text"
      className="no-print rise-in fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-overlay sm:left-auto sm:w-96 md:right-6 md:bottom-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted">
            {index + 1} of {steps.length}
          </p>
          <h2 id="tour-title" className="text-lg font-semibold">
            {step.title}
          </h2>
        </div>
        <IconButton
          icon="close"
          label="Skip the tour"
          size="sm"
          onClick={finish}
        />
      </div>
      <p id="tour-text" className="text-sm text-muted">
        {step.text}
      </p>
      {step.link && (
        <Link
          href={step.link.href}
          onClick={finish}
          className="text-sm text-primary underline"
        >
          {step.link.label}
        </Link>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="flex gap-1.5" aria-hidden>
          {steps.map((item, position) => (
            <span
              key={item.title}
              className={cn(
                "size-1.5 rounded-full",
                position === index ? "bg-primary" : "bg-line-strong",
              )}
            />
          ))}
        </span>
        <div className="flex gap-2">
          {index > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIndex(index - 1)}
            >
              Back
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => (last ? finish() : setIndex(index + 1))}
          >
            {last ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </section>
  );
}
