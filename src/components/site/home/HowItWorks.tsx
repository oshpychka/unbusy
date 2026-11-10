import Link from "next/link";
import { Container } from "../Container";

const steps = [
  {
    title: "Pick what starts it",
    text: "A form on your site, an overdue invoice, a booking, a ticket or a schedule. Each trigger shows the data it brings, so you know what you can use later.",
  },
  {
    title: "Add the logic",
    text: "Split by amount or priority, wait three days, repeat for every client on a list. Type {{ in any field to drop in a value from an earlier step and see a live preview.",
  },
  {
    title: "Watch it run before it is live",
    text: "Run the workflow on sample data and follow the path it takes. Change a value and run again. Turn it on when the result looks right.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="border-t border-line py-20">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2
            id="how-title"
            className="reveal-on-scroll text-[clamp(1.75rem,4vw,2.5rem)] font-bold"
          >
            From trigger to done in one screen
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Every workflow reads top to bottom. Branches sit side by side, so
            you can see what happens in each case without opening anything.
          </p>
          <Link
            href="/app/workflows/wf_invoices"
            className="link-underline mt-6 inline-flex min-h-11 items-center text-primary"
          >
            Open a workflow in the editor
          </Link>
        </div>
        <ol className="flex flex-col">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[3rem_1fr] gap-4 border-t border-line py-6 first:border-t-0 first:pt-0"
            >
              <span className="font-display text-3xl font-bold text-muted tabular-nums">
                {index + 1}
              </span>
              <div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
