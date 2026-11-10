import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Container } from "@/components/site/Container";
import { JsonLd } from "@/components/site/JsonLd";
import { PlaybookRow } from "@/components/site/PlaybookRow";
import { PlaybookSteps } from "@/components/site/PlaybookSteps";
import { ButtonLink } from "@/components/ui/Button";
import { FitToWidth } from "@/components/workflow/FitToWidth";
import {
  diagramSize,
  WorkflowDiagram,
} from "@/components/workflow/WorkflowDiagram";
import { getPlaybook, industries, playbooks } from "@/data/playbooks";
import { stepTitle } from "@/lib/engine/describe";
import { formatCurrency } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

const defaultRate = 45;

export function generateStaticParams() {
  return playbooks.map((playbook) => ({ slug: playbook.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) return {};
  return pageMetadata({
    title: `${playbook.title}: automation playbook`,
    absoluteTitle: true,
    ownImage: true,
    description: playbook.summary,
    path: `/playbooks/${slug}`,
  });
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  if (!playbook) notFound();

  const industry = industries.find((item) => item.id === playbook.industry);
  const hours = (playbook.manualMinutes * playbook.monthlyVolume) / 60;
  const related = playbook.related
    .map(getPlaybook)
    .filter((item) => item !== undefined);
  const calculatorLink = `/savings-calculator?t=${playbook.slug}:${playbook.monthlyVolume}:month:${playbook.manualMinutes}`;

  return (
    <Container className="pt-8 md:pt-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Playbooks", href: "/playbooks" },
          { label: playbook.title, href: `/playbooks/${playbook.slug}` },
        ]}
      />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <p className="text-sm text-muted">{industry?.label}</p>
          <h1 className="mt-2 text-[clamp(2rem,5vw,3rem)] font-bold">
            {playbook.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {playbook.summary}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-sans text-base font-semibold">The problem</h2>
              <p className="mt-1 text-muted">{playbook.problem}</p>
            </div>
            <div>
              <h2 className="font-sans text-base font-semibold">
                With this workflow
              </h2>
              <p className="mt-1 text-muted">{playbook.outcome}</p>
            </div>
          </div>

          <h2 className="mt-12 text-2xl font-bold">How it runs</h2>
          <div className="dot-grid mt-4 rounded-md border border-line p-2">
            <FitToWidth
              width={diagramSize(playbook.steps).width}
              height={diagramSize(playbook.steps).height}
            >
              <WorkflowDiagram
                trigger={playbook.trigger}
                steps={playbook.steps}
              />
            </FitToWidth>
          </div>

          <h2 className="mt-12 text-2xl font-bold">Step by step</h2>
          <div className="mt-4">
            <PlaybookSteps trigger={playbook.trigger} steps={playbook.steps} />
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-line bg-surface p-5">
            <h2 className="font-sans text-base font-semibold">
              Typical savings
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted">Hours a month</dt>
                <dd className="font-display text-2xl font-bold">
                  {Math.round(hours)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">At ${defaultRate}/h</dt>
                <dd className="font-display text-2xl font-bold">
                  {formatCurrency(hours * defaultRate)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted">
              Based on {playbook.monthlyVolume} runs a month at{" "}
              {playbook.manualMinutes} minutes of manual work each.
            </p>
            <Link
              href={calculatorLink}
              className="mt-2 inline-flex min-h-11 items-center text-sm text-primary underline"
            >
              Adjust for your numbers
            </Link>
          </div>
          <ButtonLink
            href={`/app/playbooks?use=${playbook.slug}`}
            size="lg"
            className="w-full"
          >
            Open in the demo
          </ButtonLink>
        </aside>
      </div>

      <section aria-labelledby="related-title" className="mt-16">
        <h2 id="related-title" className="reveal-on-scroll text-2xl font-bold">
          Related playbooks
        </h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {related.map((item) => (
            <PlaybookRow key={item.slug} playbook={item} />
          ))}
        </ul>
      </section>

      <JsonLd
        data={{
          "@type": "HowTo",
          name: playbook.title,
          description: playbook.summary,
          step: playbook.steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: stepTitle(step),
          })),
        }}
      />
    </Container>
  );
}
