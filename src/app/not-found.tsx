import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Container } from "@/components/site/Container";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="pt-16 md:pt-24">
          <p className="font-mono text-sm text-muted">404</p>
          <h1 className="mt-2 text-[clamp(2.25rem,5vw,3rem)] font-bold">
            This page is not part of any workflow
          </h1>
          <p className="mt-4 max-w-lg text-muted">
            The link may be old or mistyped. These pages do exist:
          </p>
          <ul className="mt-6 flex flex-col">
            {[
              ["/", "Home"],
              ["/playbooks", "Playbooks"],
              ["/savings-calculator", "Savings calculator"],
              ["/app", "Open the demo"],
            ].map(([href, label]) => (
              <li key={href} className="border-b border-line">
                <Link
                  href={href!}
                  className="flex min-h-12 items-center hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
