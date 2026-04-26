"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

type BreadcrumbItem = { name: string; url: string }

function toTitle(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function generateBreadcrumbSchema(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const url = `https://accidental-lease-ai.com/${segments
      .slice(0, index + 1)
      .join("/")}`;
    return {
      "@type": "ListItem",
      position: index + 1,
      name: toTitle(segment),
      item: url,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://accidental-lease-ai.com",
      },
      ...breadcrumbs,
    ],
  };
}

function generateBreadcrumbSchemaFromItems(items: BreadcrumbItem[]) {
  const cleaned = items
    .map((x) => ({
      name: String(x?.name ?? "").trim(),
      url: String(x?.url ?? "").trim(),
    }))
    .filter((x) => x.name.length > 0)

  const itemListElement = cleaned.map((x, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: x.name,
    item: `https://accidental-lease-ai.com${x.url.startsWith("/") ? "" : "/"}${x.url}`,
  }))

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  }
}

export function BreadcrumbSchema(props: { items?: BreadcrumbItem[] } = {}) {
  const pathname = usePathname() || "/";
  const schema = useMemo(() => {
    if (Array.isArray(props.items) && props.items.length > 0) {
      return generateBreadcrumbSchemaFromItems(props.items)
    }
    return generateBreadcrumbSchema(pathname)
  }, [pathname, props.items])

  return (
    <script
      type="application/ld+json"
      // This is structured data, not user-provided HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default BreadcrumbSchema

