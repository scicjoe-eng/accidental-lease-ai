import type { Metadata } from "next"
import type { ReactElement } from "react"
import Link from "next/link"

import type { StateLawPage } from "@/app/data/states/types"
import statesIndex from "@/app/data/states/index.json"

function slugifyHeading(s: string): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function loadStatePage(stateSlug: string): Promise<StateLawPage | null> {
  try {
    const mod = (await import(`@/app/data/states/${stateSlug}.json`)) as {
      default: StateLawPage
    }
    return mod.default
  } catch {
    return null
  }
}

// 生成页面元数据
export async function generateMetadata({
  params,
}: {
  params: Promise<{ "state-slug": string }>
}): Promise<Metadata> {
  const resolved = await params
  const stateSlug = resolved["state-slug"]
  const page = await loadStatePage(stateSlug)
  const stateName =
    page?.stateName ??
    statesIndex.find((s) => s.stateSlug === stateSlug)?.stateName ??
    stateSlug

  const canonical = `https://accidental-lease-ai.com/landlord-tenant-laws/states/${stateSlug}`

  return {
    title: page?.titleTag ?? `${stateName} Landlord Tenant Law 2026 | Rights, Deposits & Eviction`,
    description:
      page?.metaDescription ??
      `${stateName} landlord tenant law 2026: security deposit limits, eviction notice requirements, tenant rights & more. Plain-language guide for new landlords.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page?.titleTag ?? `${stateName} Landlord Tenant Law 2026`,
      description:
        page?.metaDescription ??
        `${stateName} landlord tenant law 2026: security deposit limits, eviction notice requirements, tenant rights & more.`,
      url: canonical,
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${stateName} landlord tenant law`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page?.titleTag ?? `${stateName} Landlord Tenant Law 2026`,
      description:
        page?.metaDescription ??
        `${stateName} landlord tenant law 2026: security deposit limits, eviction notice requirements, tenant rights & more.`,
      images: ["/og-image.png"],
    },
  }
}

export default function StateLandlordTenantLaws({
  params,
}: {
  params: Promise<{ "state-slug": string }>
}): Promise<ReactElement> {
  return (async () => {
    const resolved = await params
    const stateSlug = resolved?.["state-slug"] ?? ""
    const page = await loadStatePage(stateSlug)
    const stateName =
      page?.stateName ??
      statesIndex.find((s) => s.stateSlug === stateSlug)?.stateName ??
      stateSlug

    const h2Sections = (page?.sections ?? []).filter((s) => s.level === "h2")
    const toc = h2Sections.map((s) => ({
      id: slugifyHeading(s.heading),
      label: s.heading,
    }))

    const faqCandidates = h2Sections.slice(0, 5).map((s) => ({
      q: `${stateName}: ${s.heading}`,
      a: (s.body ?? []).join(" "),
    }))

    const canonical = `https://accidental-lease-ai.com/landlord-tenant-laws/states/${stateSlug}`

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* State TopicPage Schema (Article + lightweight FAQ) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: page?.h1 ?? `${stateName} Landlord Tenant Law 2026`,
                description:
                  page?.metaDescription ??
                  `${stateName} landlord tenant law 2026: security deposit limits, eviction notice requirements, tenant rights & more.`,
                mainEntityOfPage: canonical,
                about: [
                  { "@type": "Thing", name: `${stateName} landlord tenant law` },
                  { "@type": "Thing", name: `${stateName} security deposit rules` },
                  { "@type": "Thing", name: `${stateName} eviction notice requirements` },
                ],
                publisher: {
                  "@type": "Organization",
                  name: "AcciLease AI",
                  url: "https://accidental-lease-ai.com",
                },
                mainEntity: faqCandidates.length
                  ? {
                      "@type": "FAQPage",
                      mainEntity: faqCandidates.map((x) => ({
                        "@type": "Question",
                        name: x.q,
                        acceptedAnswer: { "@type": "Answer", text: x.a },
                      })),
                    }
                  : undefined,
              }),
            }}
          />

          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {stateName} landlord tenant law
          </p>
          <h1 className="mt-2 text-3xl font-bold">{page?.h1 ?? `${stateName} Landlord Tenant Law 2026`}</h1>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            {page?.metaDescription ??
              `${stateName} landlord tenant law 2026: security deposit limits, eviction notice requirements, tenant rights & more. Plain-language guide for new landlords.`}
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link className="text-primary hover:underline" href="/landlord-tenant-laws">
              Back to all states
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link className="text-primary hover:underline" href="/accidental-landlord-guide">
              Accidental landlord guide
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link className="text-primary hover:underline" href="/lease-guide">
              Lease guide
            </Link>
          </div>

          {toc.length ? (
            <div className="mt-8 rounded-lg border border-border/60 bg-background/50 p-5">
              <p className="text-sm font-semibold">On this page</p>
              <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a className="text-primary hover:underline" href={`#${t.id}`}>
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="prose dark:prose-invert mt-8 max-w-none">
            {(page?.sections ?? []).map((s, idx) => {
              if (s.level === "h2") {
                const id = slugifyHeading(s.heading)
                return (
                  <section key={`sec-${idx}-${s.heading}`}>
                    <h2 id={id}>{s.heading}</h2>
                    {s.body.map((p, i) => (
                      <p key={`p-${idx}-${i}`}>{p}</p>
                    ))}
                    {s.bullets?.length ? (
                      <ul>
                        {s.bullets.map((b) => (
                          <li key={`b-${idx}-${b.slice(0, 32)}`}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                )
              }
              return (
                <section key={`sec-${idx}-${s.heading}`}>
                  <h3>{s.heading}</h3>
                  {s.body.map((p, i) => (
                    <p key={`p-${idx}-${i}`}>{p}</p>
                  ))}
                  {s.bullets?.length ? (
                    <ul>
                      {s.bullets.map((b) => (
                        <li key={`b-${idx}-${b.slice(0, 32)}`}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              )
            })}

            <section>
              <h2>Notes for new landlords</h2>
              <ul>
                {(page?.jurisdictionNotes ?? []).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              {page?.confidenceNotes?.length ? (
                <>
                  <h3>Accuracy notes</h3>
                  <ul>
                    {page.confidenceNotes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    )
  })()
}