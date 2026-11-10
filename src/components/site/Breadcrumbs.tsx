import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

type Crumb = { label: string; href: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden>/</span>}
              {index === items.length - 1 ? (
                <span aria-current="page" className="text-text">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="link-underline inline-flex min-h-11 items-center hover:text-text"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            item: absoluteUrl(item.href === "/" ? "" : item.href),
          })),
        }}
      />
    </>
  );
}
