import type { Metadata } from "next";
import { siteName, siteUrl } from "./site";

const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Unbusy: hand off the busywork",
};

type PageMeta = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  ownImage?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  ownImage,
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
      ...(ownImage ? {} : { images: [ogImage] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ownImage ? {} : { images: [ogImage.url] }),
    },
  };
}

export function absoluteUrl(path: string) {
  return `${siteUrl}${path}`;
}
