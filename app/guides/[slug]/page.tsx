import Link from "next/link"
import { Metadata } from "next"
import type { ReactElement } from "react"

import { GUIDES_BY_SLUG } from "@/app/guides/guides"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolved = await params
  const guide = GUIDES_BY_SLUG[resolved.slug]

  if (!guide) {
    return {
      title: "Guide Not Found | AcciLease AI",
      description: "The guide you are looking for does not exist.",
    }
  }

  const canonicalUrl = `https://accidental-lease-ai.com/guides/${guide.slug}`
  return {
    title: `${guide.title} | AcciLease AI Guides`,
    description: guide.excerpt,
    keywords: guide.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: "https://accidental-lease-ai.com/og-image.png",
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<ReactElement> {
  const resolved = await params
  const slug = resolved?.slug ?? ""
  const guide = GUIDES_BY_SLUG[slug]

  if (!guide) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Guide Not Found</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            The guide you are looking for does not exist.
          </p>
          <Link
            href="/guides"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Guides
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/guides" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Back to Guides
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-6">{guide.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">{guide.excerpt}</p>

        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: guide.contentHtml }} />
        </div>
      </div>
    </div>
  )
}

