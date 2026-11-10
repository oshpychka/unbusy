import { cn } from "@/lib/cn";

type TooltipProps = {
  text: string;
  side?: "top" | "bottom";
  children: React.ReactNode;
};

export function Tooltip({ text, side = "top", children }: TooltipProps) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-40 w-max max-w-56 -translate-x-1/2 rounded-sm bg-text px-2 py-1 text-xs text-bg opacity-0 transition-opacity delay-300 group-focus-within/tip:opacity-100 group-hover/tip:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      >
        {text}
      </span>
    </span>
  );
}
