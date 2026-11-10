import { cn } from "@/lib/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hideLabel?: boolean;
  disabled?: boolean;
};

export function Switch({
  checked,
  onChange,
  label,
  hideLabel,
  disabled,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group inline-flex min-h-11 items-center gap-3 disabled:opacity-50"
    >
      <span
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-primary bg-primary"
            : "border-line-strong bg-sunken",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4.5 rounded-full transition-transform duration-200 ease-out",
            checked ? "translate-x-4 bg-on-primary" : "bg-muted",
          )}
        />
      </span>
      {!hideLabel && <span className="text-base">{label}</span>}
    </button>
  );
}
