"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { getPlaybook } from "@/data/playbooks";
import { sentences } from "@/data/sentences";
import { formatNumber } from "@/lib/format";
import { encodeTasks, monthlyHours, type Period } from "@/lib/savings";
import { Container } from "../Container";

const periods: { value: Period; label: string }[] = [
  { value: "day", label: "day" },
  { value: "week", label: "week" },
  { value: "month", label: "month" },
];

export function SentenceBuilder() {
  const [slug, setSlug] = useState(sentences[0]!.slug);
  const [per, setPer] = useState<Period>("week");
  const [countText, setCountText] = useState(String(sentences[0]!.count));
  const sentence =
    sentences.find((item) => item.slug === slug) ?? sentences[0]!;
  const count = Math.min(1000, Math.max(0, Math.round(Number(countText)) || 0));
  const hours = monthlyHours({
    id: slug,
    name: sentence.phrase,
    count,
    per,
    minutes: sentence.minutes,
  });
  const playbook = getPlaybook(slug);
  const related = (playbook?.related ?? [])
    .map(getPlaybook)
    .filter((item) => item !== undefined)
    .slice(0, 2);
  const calculator = `/savings-calculator?${encodeTasks([
    { id: slug, name: sentence.phrase, count, per, minutes: sentence.minutes },
  ])
    .map((value) => `t=${value}`)
    .join("&")}`;

  return (
    <section
      aria-labelledby="sentence-title"
      className="border-t border-line py-20"
    >
      <Container>
        <h2
          id="sentence-title"
          className="reveal-on-scroll max-w-xl text-[clamp(1.75rem,4vw,2.5rem)] font-bold"
        >
          Describe the chore, see what it costs
        </h2>
        <div className="mt-4 text-[clamp(1.25rem,3vw,1.75rem)] leading-[2.4] font-medium">
          Every{" "}
          <Select
            label="How often"
            value={per}
            options={periods}
            onChange={setPer}
            className="inline-block w-36 align-middle text-base"
          />{" "}
          I{" "}
          <Select
            label="Task"
            value={slug}
            options={sentences.map((item) => ({
              value: item.slug,
              label: item.phrase,
            }))}
            onChange={(value) => {
              setSlug(value);
              setCountText(
                String(
                  sentences.find((item) => item.slug === value)?.count ?? 10,
                ),
              );
            }}
            className="inline-block w-full align-middle text-base sm:w-80"
          />{" "}
          for about{" "}
          <input
            aria-label={`How many ${sentence.unit}`}
            inputMode="numeric"
            value={countText}
            onChange={(event) =>
              setCountText(event.target.value.replace(/[^\d]/g, "").slice(0, 4))
            }
            className="inline-block h-11 w-20 rounded-md border border-line-strong bg-surface px-3 text-center align-middle font-mono text-base focus:border-primary focus:outline-none md:h-10"
          />{" "}
          {sentence.unit}.
        </div>

        <div
          className="mt-8 grid gap-6 border-t border-line pt-8 md:grid-cols-[1fr_1.2fr]"
          aria-live="polite"
        >
          <div>
            <p className="text-sm text-muted">Time it takes by hand</p>
            <p className="font-display text-5xl font-bold tabular-nums">
              {formatNumber(hours, hours < 10 ? 1 : 0)} h
            </p>
            <p className="mt-1 text-sm text-muted">
              a month, at about {sentence.minutes} minutes each
            </p>
          </div>
          {playbook && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">Start with this playbook</p>
              <Link
                href={`/playbooks/${playbook.slug}`}
                className="font-display text-2xl font-semibold hover:text-primary"
              >
                {playbook.title}
              </Link>
              <p className="text-muted">{playbook.summary}</p>
              {related.length > 0 && (
                <p className="text-sm text-muted">
                  Teams who run it also use{" "}
                  {related.map((item, index) => (
                    <span key={item.slug}>
                      {index > 0 && " and "}
                      <Link
                        href={`/playbooks/${item.slug}`}
                        className="text-primary underline"
                      >
                        {item.title.toLowerCase()}
                      </Link>
                    </span>
                  ))}
                  .
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={`/app/playbooks?use=${playbook.slug}`}>
                  Try it in the demo
                </ButtonLink>
                <ButtonLink href={calculator} variant="secondary">
                  Add more tasks
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
