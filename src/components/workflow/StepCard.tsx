import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type StepCardState = "idle" | "active" | "ok" | "failed" | "skipped";

type StepCardProps = {
  icon: string;
  kicker: string;
  title: string;
  subtitle: string;
  state?: StepCardState;
  selected?: boolean;
  issue?: "error" | "warning";
  className?: string;
};

export function StepCard({
  icon,
  kicker,
  title,
  subtitle,
  state = "idle",
  selected,
  issue,
  className,
}: StepCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center gap-3 rounded-md border bg-surface px-3 text-left transition-[border-color,box-shadow] duration-200",
        selected
          ? "border-primary shadow-[0_0_0_1px_var(--primary)]"
          : "border-line-strong",
        state === "active" && "border-signal shadow-[0_0_0_2px_var(--signal)]",
        state === "skipped" && "opacity-55",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-1/2 -left-[4px] size-2 -translate-y-1/2 rounded-full border border-line-strong bg-bg"
      />
      <span
        aria-hidden
        className="absolute top-1/2 -right-[4px] size-2 -translate-y-1/2 rounded-full border border-line-strong bg-bg"
      />
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-md border",
          state === "active"
            ? "border-signal bg-signal text-on-signal"
            : "border-line bg-sunken text-text",
        )}
      >
        <Icon name={icon as IconName} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-xs text-muted">{kicker}</span>
        <span className="truncate text-sm font-semibold">{title}</span>
        <span className="truncate text-xs text-muted">{subtitle}</span>
      </span>
      {state === "ok" && <StatusDot className="bg-success" label="Succeeded" />}
      {state === "failed" && <StatusDot className="bg-danger" label="Failed" />}
      {issue && state === "idle" && (
        <Icon
          name="alert"
          size={16}
          label={issue === "error" ? "Has errors" : "Has warnings"}
          className={cn(
            "shrink-0",
            issue === "error" ? "text-danger" : "text-warning",
          )}
        />
      )}
    </div>
  );
}

function StatusDot({ className, label }: { className: string; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("size-2.5 shrink-0 rounded-full", className)}
    />
  );
}
