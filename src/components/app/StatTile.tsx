type StatTileProps = { label: string; value: string; note?: string };

export function StatTile({ label, value, note }: StatTileProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border border-line bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display text-2xl font-bold whitespace-nowrap tabular-nums sm:text-3xl">
        {value}
      </dd>
      {note && <dd className="text-xs text-muted">{note}</dd>}
    </div>
  );
}
