import { Container } from "@/components/site/Container";
import { JsonLd } from "@/components/site/JsonLd";
import { PricingPlans } from "@/components/site/PricingPlans";
import { comparison, faqs, plans } from "@/data/pricing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Plans from $19 a month for solo owners, small teams and agencies. Every plan includes the run debugger, retries and fallback paths.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <Container className="pt-12 md:pt-16">
      <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bold">Pricing</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Pay for the runs you use. Every plan gets the same editor, debugger and
        playbooks.
      </p>
      <div className="mt-10">
        <PricingPlans />
      </div>

      <section aria-labelledby="compare-title" className="mt-20">
        <h2 id="compare-title" className="text-2xl font-bold">
          Compare plans
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th scope="col" className="py-3 pr-4 font-medium text-muted">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    scope="col"
                    className="px-4 py-3 font-semibold"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {comparison.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="py-3 pr-4 text-left font-normal">
                    {row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={plans[index]!.id}
                      className={
                        value === "No" ? "px-4 py-3 text-muted" : "px-4 py-3"
                      }
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="mt-20 max-w-3xl">
        <h2 id="faq-title" className="text-2xl font-bold">
          Questions
        </h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {faqs.map((faq) => (
            <details key={faq.question} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden
                  className="text-xl text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
    </Container>
  );
}
