"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const FAQ_ITEMS = [
  {
    q: "What does the audit check?",
    a: "Deposits, entry, repairs, fees, eviction notice patterns, and other common risk areas.",
  },
  {
    q: "What is a locked preview?",
    a: "You’ll see a small preview first. Unlock to view everything and download once.",
  },
  {
    q: "Does this support DOCX?",
    a: "Yes — PDF and DOCX are supported.",
  },
  {
    q: "Is this state-aware?",
    a: "Yes — drafts and highlights adapt to the state you choose.",
  },
] as const

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function LandingFaq() {
  const [openKey, setOpenKey] = useState<string>(() => slugify(FAQ_ITEMS[0]?.q ?? ""))

  const items = useMemo(() => {
    return FAQ_ITEMS.map((x) => ({ ...x, key: slugify(x.q) }))
  }, [])

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        Questions
      </h2>

      {/* FAQPage Schema (eligible for rich results) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((x) => ({
              "@type": "Question",
              name: x.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: x.a,
              },
            })),
          }),
        }}
      />

      <div className="mx-auto max-w-3xl space-y-3">
        {items.map((x) => {
          const open = x.key === openKey
          return (
            <div
              key={x.key}
              className={cn(
                "rounded-xl border border-border/60 bg-card shadow-sm transition-colors",
                open ? "bg-primary/5" : "hover:bg-muted/30"
              )}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                onClick={() => setOpenKey((k) => (k === x.key ? "" : x.key))}
                aria-expanded={open}
              >
                <span className="font-heading text-base font-semibold">{x.q}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    open ? "rotate-180" : "rotate-0"
                  )}
                  aria-hidden
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {x.a}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

