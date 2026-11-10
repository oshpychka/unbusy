import { getPlaybook, industries, playbooks } from "@/data/playbooks";
import { ogImage, ogSize } from "@/lib/og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Unbusy automation playbook";

export function generateStaticParams() {
  return playbooks.map((playbook) => ({ slug: playbook.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playbook = getPlaybook(slug);
  const industry = industries.find((item) => item.id === playbook?.industry);
  return ogImage(
    playbook?.title ?? "Automation playbook",
    `Playbook for ${industry?.label.toLowerCase() ?? "small teams"}`,
  );
}
