import type { Metadata } from "next";
import { siteName, siteUrl } from "./site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
}: PageMeta): Metadata {
  const url = `${siteUrl}${path === "/" ? "" : path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "website",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function absoluteUrl(path: string) {
  return `${siteUrl}${path}`;
}
