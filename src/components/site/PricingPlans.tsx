"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Segmented } from "@/components/ui/Segmented";
import { cn } from "@/lib/cn";
import { plans } from "@/data/pricing";

type Billing = "monthly" | "yearly";

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div className="flex flex-col gap-6">
      <Segmented
        label="Billing"
        value={billing}
        onChange={setBilling}
        className="self-start"
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly, 2 months free" },
        ]}
      />
      <ul className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const price =
            billing === "monthly"
              ? plan.monthly
              : Math.round((plan.monthly * 10) / 12);
          const featured = plan.id === "team";
          return (
            <li
              key={plan.id}
              className={cn(
                "flex flex-col gap-4 rounded-md border bg-surface p-6",
                featured
                  ? "border-primary shadow-[0_0_0_1px_var(--primary)]"
                  : "border-line",
              )}
            >
              <div>
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.audience}</p>
              </div>
              <p className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tabular-nums">
                  ${price}
                </span>
                <span className="text-sm text-muted">
                  a month{billing === "yearly" ? ", billed yearly" : ""}
                </span>
              </p>
              <ul className="flex flex-1 flex-col gap-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Icon
                      name="check"
                      size={18}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href="/app"
                variant={featured ? "primary" : "secondary"}
                className="w-full"
              >
                Try it in the demo
              </ButtonLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
