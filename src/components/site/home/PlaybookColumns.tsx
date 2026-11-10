import Link from "next/link";
import { industries, playbooks } from "@/data/playbooks";
import { Container } from "../Container";

export function PlaybookColumns() {
  return (
    <section
      aria-labelledby="playbooks-title"
      className="border-t border-line py-20"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="playbooks-title"
            className="reveal-on-scroll max-w-xl text-[clamp(1.75rem,4vw,2.5rem)] font-bold"
          >
            Start from a playbook that fits your business
          </h2>
          <Link
            href="/playbooks"
            className="link-underline inline-flex min-h-11 items-center text-primary"
          >
            All 12 playbooks
          </Link>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {industries.map((industry) => (
            <div key={industry.id}>
              <h3 className="border-b border-text pb-2 font-sans text-base font-semibold">
                {industry.label}
              </h3>
              <ul className="mt-2">
                {playbooks
                  .filter((playbook) => playbook.industry === industry.id)
                  .map((playbook) => (
                    <li key={playbook.slug} className="border-b border-line">
                      <Link
                        href={`/playbooks/${playbook.slug}`}
                        className="flex min-h-12 items-center py-2 hover:text-primary"
                      >
                        {playbook.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
