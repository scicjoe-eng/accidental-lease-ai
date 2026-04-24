export type StateLawSection = {
  /**
   * Must be one of: "h2" | "h3"
   * We keep a strict heading model to guarantee SEO structure.
   */
  level: "h2" | "h3"
  /** Heading text shown on page. */
  heading: string
  /** Plain-language content (paragraphs). */
  body: string[]
  /** Optional bullet points for quick scanning. */
  bullets?: string[]
}

export type StateLawFaq = {
  question: string
  answer: string
}

export type StateLawPage = {
  stateSlug: string
  stateName: string
  year: 2026

  /** Title tag template: `[State] Landlord Tenant Law 2026 | Rights, Deposits & Eviction` */
  titleTag: string

  /** Meta description template (<= ~160 chars target). */
  metaDescription: string

  /**
   * H1 must exist and match primary intent.
   * Recommended: `[State] Landlord Tenant Law 2026`
   */
  h1: string

  /** Ordered sections (H2/H3) that cover the keyword matrix. */
  sections: StateLawSection[]

  /** Optional FAQ module; if present we can emit FAQPage JSON-LD. */
  faq?: StateLawFaq[]

  /** Guardrails to reduce hallucination and over-specific claims. */
  jurisdictionNotes: string[]
  confidenceNotes?: string[]
}

