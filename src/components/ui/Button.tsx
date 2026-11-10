import Link from "next/link";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "border border-line-strong bg-surface text-text hover:border-text",
  ghost: "text-text hover:bg-sunken",
  danger:
    "border border-line-strong bg-surface text-danger hover:border-danger",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-base gap-2 md:h-10",
  lg: "h-12 px-5 text-base gap-2",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
};

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
};

export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {icon && <Icon name={icon} size={18} />}
      {children}
    </Link>
  );
}

type IconButtonProps = React.ComponentProps<"button"> & {
  icon: IconName;
  label: string;
  size?: "sm" | "md";
};

export function IconButton({
  icon,
  label,
  size = "md",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md text-text transition-colors hover:bg-sunken active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
        size === "md" ? "size-11 md:size-10" : "size-9",
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={size === "md" ? 20 : 18} />
    </button>
  );
}
