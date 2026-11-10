import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type ChoiceProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
  description?: string;
};

export function Checkbox({
  label,
  description,
  className,
  ...props
}: ChoiceProps) {
  return (
    <label
      className={cn(
        "group flex min-h-11 cursor-pointer items-start gap-3 py-2",
        className,
      )}
    >
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-sm border border-line-strong bg-surface transition-colors checked:border-primary checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          {...props}
        />
        <Icon
          name="check"
          size={14}
          className="pointer-events-none absolute text-on-primary opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <ChoiceText label={label} description={description} />
    </label>
  );
}

export function Radio({
  label,
  description,
  className,
  ...props
}: ChoiceProps) {
  return (
    <label
      className={cn(
        "group flex min-h-11 cursor-pointer items-start gap-3 py-2",
        className,
      )}
    >
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          type="radio"
          className="peer size-5 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface transition-colors checked:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          {...props}
        />
        <span className="pointer-events-none absolute size-2.5 scale-0 rounded-full bg-primary transition-transform peer-checked:scale-100" />
      </span>
      <ChoiceText label={label} description={description} />
    </label>
  );
}

function ChoiceText({
  label,
  description,
}: {
  label: React.ReactNode;
  description?: string;
}) {
  return (
    <span className="flex flex-col">
      <span className="text-base leading-snug">{label}</span>
      {description && <span className="text-sm text-muted">{description}</span>}
    </span>
  );
}

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
