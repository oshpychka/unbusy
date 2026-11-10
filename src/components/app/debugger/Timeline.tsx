"use client";

import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { TraceEntry } from "@/lib/engine/types";

type TimelineProps = {
  trace: TraceEntry[];
  cursor: number;
  playing: boolean;
  titleOf: (entry: TraceEntry) => string;
  onCursor: (index: number) => void;
  onPlay: () => void;
};

export function Timeline({
  trace,
  cursor,
  playing,
  titleOf,
  onCursor,
  onPlay,
}: TimelineProps) {
  const last = trace.length - 1;
  const current = trace[cursor];

  return (
    <div className="flex flex-col gap-2">
      <ol className="flex h-8 items-stretch gap-0.5" aria-hidden>
        {trace.map((entry, index) => (
          <li key={`${entry.path}-${index}`} className="flex flex-1">
            <button
              type="button"
              tabIndex={-1}
              onClick={() => onCursor(index)}
              title={titleOf(entry)}
              className={cn(
                "flex flex-1 items-center justify-center rounded-sm transition-colors",
                index === cursor
                  ? "bg-signal text-on-signal"
                  : index < cursor
                    ? "bg-line-strong"
                    : "bg-sunken",
                entry.status === "failed" && index !== cursor && "bg-danger/70",
              )}
            >
              {entry.waitedMs > 0 && <Icon name="timer" size={14} />}
            </button>
          </li>
        ))}
      </ol>
      <input
        type="range"
        className="range"
        min={0}
        max={last}
        step={1}
        value={cursor}
        onChange={(event) => onCursor(Number(event.target.value))}
        aria-label="Step in this run"
        aria-valuetext={
          current
            ? `Step ${cursor + 1} of ${trace.length}: ${titleOf(current)}`
            : undefined
        }
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <IconButton
            icon="chevronRight"
            label="Previous step"
            className="rotate-180"
            disabled={cursor === 0}
            onClick={() => onCursor(cursor - 1)}
          />
          <IconButton
            icon={playing ? "pause" : "play"}
            label={playing ? "Pause" : "Replay from the start"}
            onClick={onPlay}
          />
          <IconButton
            icon="chevronRight"
            label="Next step"
            disabled={cursor === last}
            onClick={() => onCursor(cursor + 1)}
          />
        </div>
        <span className="text-sm text-muted tabular-nums">
          Step {cursor + 1} of {trace.length}
        </span>
      </div>
    </div>
  );
}
