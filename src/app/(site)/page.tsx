import { ButtonLink } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
      <h1 className="max-w-3xl text-[clamp(2.5rem,7vw,4rem)] font-bold">
        Hand off the busywork.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Build automations for leads, invoices and client onboarding on a visual
        canvas. Test every run step by step and see the hours you get back.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/app" size="lg">
          Open the demo
        </ButtonLink>
        <ButtonLink href="/playbooks" size="lg" variant="secondary">
          Browse playbooks
        </ButtonLink>
      </div>
    </section>
  );
}
