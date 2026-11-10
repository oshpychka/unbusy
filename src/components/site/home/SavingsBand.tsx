import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "../Container";

export function SavingsBand() {
  return (
    <section
      aria-labelledby="savings-title"
      className="border-y border-line bg-sunken py-16"
    >
      <Container className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2
            id="savings-title"
            className="reveal-on-scroll text-[clamp(1.75rem,4vw,2.5rem)] font-bold"
          >
            A 12-minute reminder sent 25 times a month is five hours.
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            Add up the small tasks your team repeats and the total is usually
            bigger than anyone guessed. The calculator does the math and gives
            you a link to share.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <ButtonLink href="/savings-calculator" size="lg">
            Estimate your savings
          </ButtonLink>
          <span className="text-sm text-muted">
            Plans start at $19 a month.{" "}
            <Link href="/pricing" className="text-primary underline">
              See pricing
            </Link>
          </span>
        </div>
      </Container>
    </section>
  );
}
