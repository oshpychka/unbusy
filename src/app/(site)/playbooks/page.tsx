import { Container } from "@/components/site/Container";
import { PlaybookFilter } from "@/components/site/PlaybookFilter";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Automation playbooks for small businesses",
  description:
    "Twelve ready-made workflows for service businesses, agencies and SaaS teams: chasing invoices, answering leads, onboarding clients and more.",
  path: "/playbooks",
});

export default function PlaybooksPage() {
  return (
    <Container className="pt-12 md:pt-16">
      <h1 className="max-w-2xl text-[clamp(2.25rem,5vw,3rem)] font-bold">
        Playbooks
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Workflows other teams already run every day. Read how each one works,
        then copy it into the demo and change whatever does not fit.
      </p>
      <div className="mt-10">
        <PlaybookFilter />
      </div>
    </Container>
  );
}
