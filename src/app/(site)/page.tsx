import { Hero } from "@/components/site/home/Hero";
import { HowItWorks } from "@/components/site/home/HowItWorks";
import { PlaybookColumns } from "@/components/site/home/PlaybookColumns";
import { SavingsBand } from "@/components/site/home/SavingsBand";
import { SentenceBuilder } from "@/components/site/home/SentenceBuilder";
import { JsonLd } from "@/components/site/JsonLd";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Unbusy: workflow automation for small teams",
  description: siteDescription,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <SentenceBuilder />
      <HowItWorks />
      <PlaybookColumns />
      <SavingsBand />
      <JsonLd data={{ "@type": "WebSite", name: siteName, url: siteUrl }} />
      <JsonLd
        data={{
          "@type": "Organization",
          name: siteName,
          url: siteUrl,
          logo: `${siteUrl}/icon.svg`,
        }}
      />
      <JsonLd
        data={{
          "@type": "SoftwareApplication",
          name: siteName,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: siteDescription,
          offers: { "@type": "Offer", price: "19", priceCurrency: "USD" },
        }}
      />
    </>
  );
}
