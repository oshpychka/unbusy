"use client";

import { Segmented } from "@/components/ui/Segmented";
import { useUrlState } from "@/hooks/useUrlState";
import { industries, playbooks, type Industry } from "@/data/playbooks";
import { PlaybookRow } from "./PlaybookRow";

const values = ["all", ...industries.map((item) => item.id)] as const;

export function PlaybookFilter() {
  const [industry, setIndustry] = useUrlState<Industry | "all">(
    "for",
    "all",
    values,
  );
  const visible = playbooks.filter(
    (playbook) => industry === "all" || playbook.industry === industry,
  );

  return (
    <>
      <Segmented
        label="Industry"
        value={industry}
        onChange={setIndustry}
        options={[
          { value: "all", label: "All" },
          ...industries.map((item) => ({ value: item.id, label: item.label })),
        ]}
        className="max-w-full overflow-x-auto"
      />
      <p className="sr-only" aria-live="polite">
        {visible.length} playbooks shown
      </p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {visible.map((playbook) => (
          <PlaybookRow key={playbook.slug} playbook={playbook} />
        ))}
      </ul>
    </>
  );
}
