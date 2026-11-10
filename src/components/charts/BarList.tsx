type BarListItem = {
  key: string;
  label: string;
  value: number;
  display: string;
  href?: string;
};

export function BarList({
  title,
  items,
}: {
  title: string;
  items: BarListItem[];
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="text-sm font-semibold">{title}</figcaption>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex flex-col gap-1"
            title={`${item.label}: ${item.display}`}
          >
            <span className="flex items-baseline justify-between gap-3 text-sm">
              {item.href ? (
                <a href={item.href} className="truncate hover:text-primary">
                  {item.label}
                </a>
              ) : (
                <span className="truncate">{item.label}</span>
              )}
              <span className="shrink-0 tabular-nums text-muted">
                {item.display}
              </span>
            </span>
            <span
              aria-hidden
              className="h-2 overflow-hidden rounded-full bg-sunken"
            >
              <span
                className="block h-full rounded-full bg-chart"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
