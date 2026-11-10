import type { MetadataRoute } from "next";
import { playbooks } from "@/data/playbooks";
import { absoluteUrl } from "@/lib/seo";

const updated = new Date("2026-11-10");

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/playbooks",
    "/pricing",
    "/savings-calculator",
    "/privacy",
    "/terms",
  ];
  return [
    ...pages.map((path) => ({ url: absoluteUrl(path), lastModified: updated })),
    ...playbooks.map((playbook) => ({
      url: absoluteUrl(`/playbooks/${playbook.slug}`),
      lastModified: updated,
    })),
  ];
}
