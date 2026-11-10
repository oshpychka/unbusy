import { cn } from "@/lib/cn";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-2 text-sm font-medium"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted">Optional</span>
        )}
      </label>
      {children}
      <p
        id={`${id}-message`}
        className={cn("min-h-5 text-xs", error ? "text-danger" : "text-muted")}
        aria-live={error ? "polite" : undefined}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

export function fieldDescribedBy(id: string) {
  return `${id}-message`;
}

export const controlClass =
  "w-full rounded-md border border-line-strong bg-surface px-3 text-base text-text placeholder:text-muted transition-colors hover:border-muted focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary aria-[invalid=true]:border-danger disabled:opacity-50";
