import { ButtonLink } from "@/components/ui/Button";
import { Container } from "../Container";
import { HeroLive } from "./HeroLive";

export function Hero() {
  return (
    <Container className="grid items-center gap-10 pt-12 pb-16 md:pt-20 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h1 className="rise-in text-[clamp(2.75rem,7vw,4.25rem)] leading-[1.02] font-bold">
          Hand off the busywork.
        </h1>
        <p className="rise-in mt-6 max-w-lg text-lg text-muted [animation-delay:80ms]">
          Unbusy turns the follow-ups your team does by hand into workflows:
          chasing invoices, answering leads, onboarding clients. Build them on a
          canvas, test them on sample data, and see the hours you get back.
        </p>
        <div className="rise-in mt-8 flex flex-wrap gap-3 [animation-delay:160ms]">
          <ButtonLink href="/app" size="lg">
            Open the demo
          </ButtonLink>
          <ButtonLink href="/playbooks" size="lg" variant="secondary">
            Browse playbooks
          </ButtonLink>
        </div>
        <p className="mt-4 text-sm text-muted">
          No sign-up. The demo runs in your browser on sample data.
        </p>
      </div>
      <div className="rise-in min-w-0 [animation-delay:240ms]">
        <HeroLive />
      </div>
    </Container>
  );
}
