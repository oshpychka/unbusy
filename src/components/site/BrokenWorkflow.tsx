"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StepCard } from "@/components/workflow/StepCard";

const links = [
  ["/", "Home"],
  ["/playbooks", "Playbooks"],
  ["/savings-calculator", "Savings calculator"],
  ["/app", "Open the demo"],
] as const;

export function BrokenWorkflow() {
  const [fixed, setFixed] = useState(false);

  return (
    <div className="dot-grid flex w-full max-w-sm flex-col items-center rounded-lg border border-line p-6">
      <div className="h-[68px] w-full">
        <StepCard
          icon="webhook"
          kicker="Trigger"
          title="Page requested"
          subtitle="This address"
          state={fixed ? "ok" : "idle"}
        />
      </div>
      <svg
        width="40"
        height="60"
        viewBox="0 0 40 60"
        aria-hidden
        className="shrink-0"
      >
        {fixed ? (
          <path
            d="M20 0V60"
            className="draw-line stroke-signal"
            strokeWidth="2"
            fill="none"
          />
        ) : (
          <>
            <path
              d="M20 0V20M20 40V60"
              className="stroke-line-strong"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M14 26l12 8M26 26l-12 8"
              className="stroke-danger"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      <div className="h-[68px] w-full">
        <StepCard
          icon="book"
          kicker="Action"
          title={fixed ? "Show useful pages" : "Show the page"}
          subtitle={fixed ? "4 links" : "Page not found"}
          state={fixed ? "ok" : "failed"}
        />
      </div>
      {fixed ? (
        <ul className="rise-in mt-6 w-full" aria-live="polite">
          {links.map(([href, label]) => (
            <li key={href} className="border-b border-line">
              <Link
                href={href}
                className="flex min-h-12 items-center justify-between hover:text-primary"
              >
                {label}
                <Icon name="chevronRight" size={16} className="text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Button icon="redo" className="mt-6" onClick={() => setFixed(true)}>
          Fix it
        </Button>
      )}
    </div>
  );
}
