import { Container } from "@/components/site/Container";
import { SavingsCalculator } from "@/components/site/SavingsCalculator";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Automation savings calculator",
  description:
    "Estimate how many hours and dollars your team would save by automating invoices, lead replies, reminders and other repetitive work.",
  path: "/savings-calculator",
});

export default function SavingsCalculatorPage() {
  return (
    <Container className="pt-12 md:pt-16">
      <h1 className="max-w-2xl text-[clamp(2.25rem,5vw,3rem)] font-bold">
        How much time would you get back?
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        List the tasks your team repeats, how often and how long each takes. The
        numbers update as you type, and the link keeps your estimate.
      </p>
      <div className="mt-10">
        <SavingsCalculator />
      </div>
    </Container>
  );
}
