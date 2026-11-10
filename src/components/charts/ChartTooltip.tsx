export type TooltipState = {
  x: number;
  y: number;
  title: string;
  lines: string[];
} | null;

export function ChartTooltip({ tip }: { tip: TooltipState }) {
  if (!tip) return null;
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap shadow-overlay"
      style={{ left: tip.x, top: tip.y - 8 }}
    >
      <p className="font-medium">{tip.title}</p>
      {tip.lines.map((line) => (
        <p key={line} className="text-muted">
          {line}
        </p>
      ))}
    </div>
  );
}
