import Link from "next/link"
import { Metadata } from "next"

import { GUIDES } from "@/app/guides/guides"

export const metadata: Metadata = {
  title: "Guides | AcciLease AI",
  description:
    "Guides for accidental landlords: lease basics, tenant screening, maintenance workflows, and more.",
  alternates: {
    canonical: "https://accidental-lease-ai.com/guides",
  },
}

export default function GuidesIndexPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Guides</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Practical, plain-English guides for accidental landlords.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {GUIDES.map((g) => (
          <div
            key={g.slug}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-2">
              <Link
                href={`/guides/${g.slug}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {g.title}
              </Link>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{g.excerpt}</p>
            <Link
              href={`/guides/${g.slug}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Read guide →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

