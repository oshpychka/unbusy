import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description:
    "What the Unbusy demo stores, where it stores it and what we measure. Short version: your data stays in your browser.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="November 10, 2026">
      <p>
        Unbusy is a demo product. This page describes exactly what the site does
        with data.
      </p>
      <h2>What stays in your browser</h2>
      <p>
        Workflows you create, edits, settings and run history are saved in your
        browser&apos;s local storage. They are never sent to a server. Clearing
        site data or pressing Reset demo in settings removes them.
      </p>
      <h2>What we measure</h2>
      <p>
        We count page views with Vercel Web Analytics. It does not use cookies
        and does not collect personal data or build profiles across sites. It
        records the page, referrer, browser, device type and country.
      </p>
      <h2>Forms and messages</h2>
      <p>
        No email, text message, invoice or other message is ever sent by the
        demo. Every app action is simulated on sample data.
      </p>
      <h2>Cookies</h2>
      <p>The site does not set cookies.</p>
      <h2>Contact</h2>
      <p>
        Questions about this page can be sent through the contact details on the
        project&apos;s repository.
      </p>
    </LegalPage>
  );
}
