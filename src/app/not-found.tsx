import { BrokenWorkflow } from "@/components/site/BrokenWorkflow";
import { Container } from "@/components/site/Container";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="grid items-center gap-10 pt-16 md:grid-cols-2 md:pt-24">
          <div>
            <p className="font-mono text-sm text-muted">Error 404</p>
            <h1 className="mt-2 text-[clamp(2.25rem,5vw,3rem)] font-bold">
              This step has nowhere to go
            </h1>
            <p className="mt-4 max-w-md text-muted">
              The page you asked for does not exist. It may have moved, or the
              link has a typo. One click repairs the workflow on the right.
            </p>
          </div>
          <BrokenWorkflow />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
