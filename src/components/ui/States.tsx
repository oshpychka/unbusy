import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block animate-pulse rounded-sm bg-sunken", className)}
    />
  );
}

type EmptyStateProps = {
  icon: IconName;
  title: string;
  text?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  text,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "dot-grid flex flex-col items-start gap-3 rounded-md border border-dashed border-line-strong p-6",
        className,
      )}
    >
      <span className="grid size-10 place-items-center rounded-md border border-line bg-surface text-muted">
        <Icon name={icon} />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        {text && <p className="mt-1 max-w-prose text-sm text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}

type BadgeProps = {
  tone?: "neutral" | "success" | "danger" | "warning" | "primary";
  children: React.ReactNode;
  className?: string;
};

const badgeTones = {
  neutral: "text-muted",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  primary: "text-primary",
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-line px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
