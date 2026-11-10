import { ButtonLink } from "@/components/ui/Button";
import { FitToWidth } from "@/components/workflow/FitToWidth";
import {
  diagramSize,
  WorkflowDiagram,
} from "@/components/workflow/WorkflowDiagram";
import { heroSteps, heroTrigger } from "@/data/hero";
import { Container } from "../Container";

export function Hero() {
  return (
    <Container className="grid items-center gap-10 pt-12 pb-16 md:pt-20 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <h1 className="text-[clamp(2.75rem,7vw,4.25rem)] leading-[1.02] font-bold">
          Hand off the busywork.
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          Unbusy turns the follow-ups your team does by hand into workflows:
          chasing invoices, answering leads, onboarding clients. Build them on a
          canvas, test them on sample data, and see the hours you get back.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
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
      <div className="dot-grid min-w-0 rounded-lg border border-line p-2">
        <FitToWidth
          width={diagramSize(heroSteps).width}
          height={diagramSize(heroSteps).height}
        >
          <WorkflowDiagram trigger={heroTrigger} steps={heroSteps} />
        </FitToWidth>
      </div>
    </Container>
  );
}
