import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { siteTagline } from "@/lib/site";
import { siteNav } from "./nav-links";

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            {siteTagline} Automations for leads, invoices and onboarding.
          </p>
          <p className="max-w-sm text-xs text-muted">
            This is a demo product. Workflows run in your browser on sample
            data, nothing is sent anywhere.
          </p>
        </div>
        <FooterColumn
          title="Product"
          links={[...siteNav, { href: "/app", label: "Open the demo" }]}
        />
        <FooterColumn title="Legal" links={legal} />
      </div>
      <div className="mx-auto max-w-6xl border-t border-line px-4 py-6 text-xs text-muted sm:px-6">
        © {new Date().getFullYear()} Unbusy
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="font-sans text-sm font-semibold">{title}</h2>
      <ul className="mt-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="link-underline inline-flex min-h-11 items-center text-sm text-muted hover:text-text"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
