"use client";

import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/cn";
import type { DataRecord, TraceEntry, Workflow } from "@/lib/engine/types";
import { formatDateTime, formatDuration } from "@/lib/format";
import { containsPersonalData, maskRecord } from "@/lib/mask";
import { entryNotes } from "./entry-notes";

type EntryDetailsProps = {
  entry: TraceEntry;
  title: string;
  runStart: number;
  workflow?: Workflow;
  reveal: boolean;
  onReveal: (reveal: boolean) => void;
};

const toneClass = {
  muted: "text-muted",
  warning: "text-warning",
  danger: "text-danger",
  signal: "text-text",
};

function DataBlock({
  label,
  data,
  reveal,
}: {
  label: string;
  data: DataRecord | null;
  reveal: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="font-sans text-xs font-semibold text-muted">{label}</h3>
      <pre className="max-h-64 overflow-auto rounded-md border border-line bg-sunken px-3 py-2 font-mono text-xs leading-relaxed">
        {data && Object.keys(data).length
          ? JSON.stringify(reveal ? data : maskRecord(data), null, 2)
          : "Nothing"}
      </pre>
    </div>
  );
}

export function EntryDetails({
  entry,
  title,
  runStart,
  workflow,
  reveal,
  onReveal,
}: EntryDetailsProps) {
  const notes = entryNotes(entry, workflow);
  const personal =
    containsPersonalData(entry.input) || containsPersonalData(entry.output);
  const offset = entry.startedAt - runStart;

  return (
    <div className="flex min-w-0 flex-col gap-4" aria-live="polite">
      <div>
        <p className="text-xs text-muted">
          {offset === 0
            ? "At the start"
            : `${formatDuration(offset)} after the start`}
          , {formatDateTime(entry.startedAt)}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      </div>
      {notes.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {notes.map((note) => (
            <li
              key={note.text}
              className={cn(
                "flex items-start gap-2 text-sm",
                toneClass[note.tone],
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  note.tone === "signal" ? "bg-signal" : "bg-current",
                )}
              />
              {note.text}
            </li>
          ))}
        </ul>
      )}
      <DataBlock label="Input" data={entry.input} reveal={reveal} />
      <DataBlock label="Output" data={entry.output} reveal={reveal} />
      {personal && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-line px-3">
          <span className="text-sm text-muted">
            Emails and phone numbers are hidden
          </span>
          <Switch checked={reveal} onChange={onReveal} label="Show" />
        </div>
      )}
    </div>
  );
}
