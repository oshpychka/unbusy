import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of use for the Unbusy demo",
  absoluteTitle: true,
  description:
    "Terms for using the Unbusy demo: a sample product with simulated apps and no real accounts or payments.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="November 10, 2026">
      <p>By using this site you agree to these terms.</p>
      <h2>A demo, not a service</h2>
      <p>
        Unbusy shows how a workflow automation product could work. There are no
        accounts, subscriptions or payments, and the prices on the pricing page
        are examples.
      </p>
      <h2>Sample data</h2>
      <p>
        Companies, people, phone numbers and amounts in the demo are made up.
        Phone numbers use the 555-01xx range reserved for fiction, and email
        addresses use example domains.
      </p>
      <h2>No warranty</h2>
      <p>
        The site is provided as is. Do not rely on its estimates for financial
        decisions.
      </p>
    </LegalPage>
  );
}
