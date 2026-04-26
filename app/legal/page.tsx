import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Legal | AcciLease AI",
  description: "Legal information, terms, and disclaimers for AcciLease AI.",
  alternates: { canonical: "https://accidental-lease-ai.com/legal" },
}

export default function LegalIndexPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Legal</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          This page collects the core legal policies for AcciLease AI. If you have questions, contact us via the
          information on the About page.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-border/60 p-5">
            <h2 className="text-xl font-semibold mb-2">Terms</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Usage terms and important limitations.
            </p>
            <Link className="text-indigo-600 dark:text-indigo-400 hover:underline" href="/legal/terms">
              Read Terms →
            </Link>
          </div>

          <div className="rounded-lg border border-border/60 p-5">
            <h2 className="text-xl font-semibold mb-2">Disclaimer</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Not legal advice; how to use outputs responsibly.
            </p>
            <Link className="text-indigo-600 dark:text-indigo-400 hover:underline" href="/legal/disclaimer">
              Read Disclaimer →
            </Link>
          </div>

          <div className="rounded-lg border border-border/60 p-5">
            <h2 className="text-xl font-semibold mb-2">Privacy</h2>
            <p className="text-sm text-muted-foreground mb-3">
              How we handle data and privacy.
            </p>
            <Link className="text-indigo-600 dark:text-indigo-400 hover:underline" href="/privacy">
              Read Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

