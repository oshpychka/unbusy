const paths = {
  menu: "M3 6h14M3 10h14M3 14h14",
  close: "M5 5l10 10M15 5L5 15",
  sun: "M10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.3 4.3l1.1 1.1M14.6 14.6l1.1 1.1M4.3 15.7l1.1-1.1M14.6 5.4l1.1-1.1",
  moon: "M16 12.5A6.5 6.5 0 0 1 7.5 4a6.5 6.5 0 1 0 8.5 8.5z",
  monitor: "M3 4h14v9H3zM7 17h6M10 13v4",
  chevronDown: "M6 8l4 4 4-4",
  chevronRight: "M8 6l4 4-4 4",
  check: "M4.5 10.5l3.5 3.5 7.5-8",
  plus: "M10 4v12M4 10h12",
  minus: "M4 10h12",
  search: "M8.5 3.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12.2 12.2L16.5 16.5",
  overview: "M3 3h6v6H3zM11 3h6v4h-6zM11 9h6v8h-6zM3 11h6v6H3z",
  workflow:
    "M3 4h5v4H3zM12 12h5v4h-5zM5.5 8v3a1 1 0 0 0 1 1H12M12 4h5v4h-5zM8 6h4",
  runs: "M4 5h12M4 10h12M4 15h7M15 13.5v3l2 1",
  chart: "M3 17h14M5 14V9M9 14V5M13 14v-3M17 14V7",
  book: "M4 4.5A1.5 1.5 0 0 1 5.5 3H16v12H5.5A1.5 1.5 0 0 0 4 16.5zM4 16.5A1.5 1.5 0 0 0 5.5 18H16",
  settings:
    "M10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4",
  play: "M6 4l10 6-10 6z",
  trash: "M4 6h12M8 6V4h4v2M5.5 6l.8 10.5h7.4L14.5 6",
  copy: "M7 7h9v9H7zM4 13V4h9",
  arrowUp: "M10 16V4M5 9l5-5 5 5",
  arrowDown: "M10 4v12M5 11l5 5 5-5",
  undo: "M7 5L3.5 8.5 7 12M4 8.5h8a4 4 0 0 1 0 8H9",
  redo: "M13 5l3.5 3.5L13 12M16 8.5H8a4 4 0 0 0 0 8h3",
  zoomIn:
    "M8.5 3.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12.2 12.2l4.3 4.3M8.5 6.5v4M6.5 8.5h4",
  zoomOut:
    "M8.5 3.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12.2 12.2l4.3 4.3M6.5 8.5h4",
  fit: "M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4",
  alert: "M10 3l8 14H2zM10 8v4M10 14.5v.5",
  info: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 9v5M10 6.5v.5",
  external: "M11 3h6v6M17 3l-8 8M14 12v5H3V6h5",
  mail: "M3 5h14v10H3zM3 5l7 6 7-6",
  message: "M3 4h14v10H8l-4 3v-3H3z",
  users:
    "M7.5 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM2.5 17a5 5 0 0 1 10 0M13 4.5a3 3 0 0 1 0 5.5M15 12.5a5 5 0 0 1 2.5 4.5",
  invoice: "M5 2.5h10v15l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5zM8 7h4M8 10h4M8 13h2",
  calendar: "M3 5h14v12H3zM3 9h14M7 3v4M13 3v4",
  chat: "M3 4h11v8H7l-4 3zM16 8h1v8l-3-2.5H9v-1.5",
  table: "M3 4h14v12H3zM3 8h14M3 12h14M8 4v12",
  form: "M4 3h12v14H4zM7 7h6M7 10h6M7 13h3",
  webhook:
    "M8 6.5a2.5 2.5 0 1 1 3.5 2.3L13.5 13M6.5 9.5L4 14a2.5 2.5 0 1 0 3.5 2.2M10 15.5h5.5a2.5 2.5 0 1 0-1-4.7",
  clock: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM10 6v4l3 2",
  gauge: "M3 14a7 7 0 1 1 14 0M10 14l3.5-4.5M3 14h1.5M15.5 14H17",
  branch: "M6 3v14M6 8c0 3 8 2 8 6v3M14 3v3",
  filter: "M3 4h14l-5.5 6.5V16l-3 1.5v-7z",
  timer: "M10 5.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM10 8.5v3l2 1M8 2.5h4",
  transform:
    "M7 4C5 4 5 6 5 7.5S4 10 3 10c1 0 2 1 2 2.5S5 16 7 16M13 4c2 0 2 2 2 3.5s1 2.5 2 2.5c-1 0-2 1-2 2.5S15 16 13 16",
  loop: "M14 4l2.5 2.5L14 9M3.5 10V9a2.5 2.5 0 0 1 2.5-2.5h10.5M6 16l-2.5-2.5L6 11M16.5 10v1a2.5 2.5 0 0 1-2.5 2.5H3.5",
  share: "M10 3v10M6 7l4-4 4 4M4 11v6h12v-6",
  download: "M10 3v10M6 9l4 4 4-4M4 17h12",
  upload: "M10 13V3M6 7l4-4 4 4M4 17h12",
  dots: "M5 10h.01M10 10h.01M15 10h.01",
  eye: "M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10zM10 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  bolt: "M11 2L4 11h5l-1 7 7-9h-5z",
  stop: "M5 5h10v10H5z",
  command:
    "M7 7V5.5A1.5 1.5 0 1 0 5.5 7H7zm0 0h6M7 7v6m6-6V5.5A1.5 1.5 0 1 1 14.5 7H13zm0 0v6m0 0v1.5a1.5 1.5 0 1 0 1.5-1.5H13zm0 0H7m0 0v1.5A1.5 1.5 0 1 1 5.5 13H7z",
} as const;

export type IconName = keyof typeof paths;

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  label?: string;
};

export function Icon({ name, size = 20, className, label }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
