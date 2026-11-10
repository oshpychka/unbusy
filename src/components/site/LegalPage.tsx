import { Container } from "./Container";

type LegalPageProps = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <Container className="pt-12 md:pt-16">
      <article className="max-w-2xl">
        <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated {updated}</p>
        <div className="mt-8 flex flex-col gap-4 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_p]:text-muted [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted">
          {children}
        </div>
      </article>
    </Container>
  );
}
