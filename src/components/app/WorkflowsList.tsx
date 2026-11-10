"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Button, ButtonLink, IconButton } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Dialog } from "@/components/ui/Dialog";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { toast } from "@/components/ui/Toaster";
import { triggerMeta } from "@/components/workflow/step-meta";
import { useWorkspaceReady } from "@/hooks/useWorkspaceReady";
import { lintWorkflow } from "@/lib/engine/lint";
import type { Workflow } from "@/lib/engine/types";
import { blankDraft } from "@/lib/workflow-factory";
import { maxImportBytes, parseWorkflowFile } from "@/lib/workflow-io";
import { formatPercent, formatRelative } from "@/lib/format";
import { useWorkspace } from "@/lib/store/workspace";
import { PageHeader } from "./PageHeader";

type Filter = "all" | "on" | "off";

export function WorkflowsList() {
  const ready = useWorkspaceReady();
  const router = useRouter();
  const {
    workflows,
    runs,
    setEnabled,
    duplicateWorkflow,
    deleteWorkflow,
    addDraft,
  } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingDelete, setPendingDelete] = useState<Workflow | null>(null);

  const stats = useMemo(() => {
    const map = new Map<
      string,
      { runs: number; failed: number; last: number }
    >();
    for (const run of runs) {
      const current = map.get(run.workflowId) ?? {
        runs: 0,
        failed: 0,
        last: 0,
      };
      current.runs++;
      if (run.status === "failed") current.failed++;
      current.last = Math.max(current.last, run.startedAt);
      map.set(run.workflowId, current);
    }
    return map;
  }, [runs]);

  const visible = workflows.filter(
    (workflow) =>
      (filter === "all" || (filter === "on") === workflow.enabled) &&
      workflow.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  async function importFile(file: File | undefined) {
    if (!file) return;
    if (file.size > maxImportBytes)
      return toast("The file is larger than 200 KB", "danger");
    const result = parseWorkflowFile(await file.text());
    if (!result.ok) return toast(result.error, "danger");
    const id = addDraft(result.value);
    toast("Workflow imported. It starts turned off.", "success");
    router.push(`/app/workflows/${id}`);
  }

  function createBlank() {
    router.push(`/app/workflows/${addDraft(blankDraft)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Workflows"
        description="Automations in this workspace."
        actions={
          <>
            <Button
              variant="secondary"
              icon="upload"
              onClick={() => fileRef.current?.click()}
            >
              Import
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-label="Import a workflow file"
              onChange={(event) => {
                importFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <ButtonLink href="/app/playbooks" variant="secondary" icon="book">
              From a playbook
            </ButtonLink>
            <Button icon="plus" onClick={createBlank}>
              New workflow
            </Button>
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <Input
            type="search"
            aria-label="Search workflows"
            placeholder="Search workflows"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <Segmented
          label="Status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ]}
        />
      </div>

      {!ready ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-20 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="workflow"
          title={workflows.length ? "No workflows match" : "No workflows yet"}
          text={
            workflows.length
              ? "Try a different search or filter."
              : "Start from a playbook or build one from scratch."
          }
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
          {visible.map((workflow) => {
            const meta = triggerMeta(workflow.trigger);
            const stat = stats.get(workflow.id);
            return (
              <li
                key={workflow.id}
                className="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-sunken/60"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-sunken">
                  <Icon name={meta.icon as IconName} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/app/workflows/${workflow.id}`}
                    className="font-medium after:absolute after:inset-0"
                  >
                    {workflow.name}
                  </Link>
                  <p className="truncate text-sm text-muted">
                    {meta.title}, {workflow.steps.length} steps
                  </p>
                </div>
                <dl className="hidden gap-6 text-sm lg:flex">
                  <div>
                    <dt className="text-xs text-muted">Last run</dt>
                    <dd>{stat ? formatRelative(stat.last) : "Never"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Success, 30 days</dt>
                    <dd>
                      {stat
                        ? formatPercent(1 - stat.failed / stat.runs)
                        : "No runs"}
                    </dd>
                  </div>
                </dl>
                <div className="relative z-10 flex items-center gap-1">
                  <Switch
                    checked={workflow.enabled}
                    hideLabel
                    label={`${workflow.name} is ${workflow.enabled ? "on" : "off"}`}
                    onChange={(value) => {
                      const errors = lintWorkflow(workflow).filter(
                        (issue) => issue.severity === "error",
                      ).length;
                      if (value && errors > 0) {
                        toast(
                          `Open the workflow and fix ${errors} ${errors === 1 ? "error" : "errors"} first`,
                          "danger",
                        );
                        return;
                      }
                      setEnabled(workflow.id, value);
                    }}
                  />
                  <IconButton
                    icon="copy"
                    label={`Duplicate ${workflow.name}`}
                    onClick={() => {
                      duplicateWorkflow(workflow.id);
                      toast("Workflow duplicated", "success");
                    }}
                  />
                  <IconButton
                    icon="trash"
                    label={`Delete ${workflow.name}`}
                    onClick={() => setPendingDelete(workflow)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete this workflow?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" and its run history will be removed.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (pendingDelete) deleteWorkflow(pendingDelete.id);
              setPendingDelete(null);
              toast("Workflow deleted");
            }}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
