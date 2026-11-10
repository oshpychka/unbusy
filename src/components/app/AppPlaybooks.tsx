"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Segmented } from "@/components/ui/Segmented";
import { industries, playbooks, type Industry } from "@/data/playbooks";
import { getApp } from "@/data/apps";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { useWorkspace } from "@/lib/store/workspace";
import { PageHeader } from "./PageHeader";

export function AppPlaybooks() {
  const router = useRouter();
  const createFromPlaybook = useWorkspace((state) => state.createFromPlaybook);
  const [industry, setIndustry] = useState<Industry | "all">("all");
  const ready = useWorkspaceReady();
  const requested = useSearchParams().get("use");
  const handled = useRef(false);

  useEffect(() => {
    if (!ready || !requested || handled.current) return;
    handled.current = true;
    const id = createFromPlaybook(requested);
    router.replace(id ? `/app/workflows/${id}` : "/app/playbooks");
  }, [ready, requested, createFromPlaybook, router]);

  const visible = playbooks.filter(
    (playbook) => industry === "all" || playbook.industry === industry,
  );

  function use(slug: string) {
    const id = createFromPlaybook(slug);
    if (id) router.push(`/app/workflows/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Playbooks"
        description="Ready-made workflows. Copy one, then adjust it to your tools and wording."
      />
      <Segmented
        label="Industry"
        value={industry}
        onChange={setIndustry}
        className="self-start"
        options={[
          { value: "all", label: "All" },
          ...industries.map((item) => ({ value: item.id, label: item.short })),
        ]}
      />
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((playbook) => (
          <li
            key={playbook.slug}
            className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4"
          >
            <span className="flex items-center gap-2 text-xs text-muted">
              <Icon
                name={getApp(playbook.trigger.app).icon as IconName}
                size={16}
              />
              {industries.find((item) => item.id === playbook.industry)?.label}
            </span>
            <h2 className="text-lg font-semibold">{playbook.title}</h2>
            <p className="flex-1 text-sm text-muted">{playbook.summary}</p>
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="text-xs text-muted">
                Saves about {playbook.manualMinutes} min per run
              </span>
              <Button size="sm" onClick={() => use(playbook.slug)}>
                Use playbook
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
