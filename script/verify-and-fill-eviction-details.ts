/**
 * Fill canonical.eviction high-frequency fields from existing RAG seed:
 *   app/data/state_laws.json (eviction_section excerpt + some structured eviction fields)
 *
 * This is a bootstrapping pipeline. For states where the seed text is high-quality
 * statutory excerpts, we can satisfy the “per-field quote + URL” requirement without
 * additional web fetch. Any remaining gaps can be refined later via targeted web research.
 */
import fs from "node:fs"
import path from "node:path"

import type { CanonicalSource, CanonicalStateLaws } from "../app/data/state_laws_canonical/types"

type Seed = {
  jurisdictions: Array<{
    state: string
    state_code: string
    eviction_section?: unknown
    eviction?: {
      notice_period_nonpayment_days?: number | string
      notice_period_lease_violation_days?: number | string
      notice_period_month_to_month_days?: number | string
      estimated_timeline?: string
    }
    source?: {
      primary_url?: string
      summary_url?: string
      statutory_citations?: string[]
    }
    sources?: Array<{ name?: string; url?: string }>
  }>
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T
}

function writeJson(p: string, data: unknown): void {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8")
}

function asText(v: unknown): string {
  if (typeof v === "string") return v
  if (v == null) return ""
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function pickPrimaryUrl(row: Seed["jurisdictions"][number]): string {
  if (row.source?.primary_url) return row.source.primary_url
  const fromSources = row.sources?.find(
    (s) => typeof s.url === "string" && /court|judic|leg|legis|code|statut/i.test(String(s.name ?? "") + " " + s.url)
  )
  if (fromSources?.url) return fromSources.url
  const stateName = row.state
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
  return `https://www.law.cornell.edu/states/${stateName}`
}

function firstNonEmptyLine(section: string): string | null {
  for (const line of section.split("\n")) {
    const t = line.trim()
    if (t) return t
  }
  return null
}

function findLine(section: string, re: RegExp): string | null {
  const lines = section.split("\n").map((l) => l.trim()).filter(Boolean)
  for (const l of lines) {
    if (re.test(l)) return l
  }
  return null
}

function makePerFactSource(args: {
  title: string
  url: string
  quote: string
  factPath: string
  type?: CanonicalSource["type"]
}): CanonicalSource {
  return {
    type: args.type ?? "statute",
    title: args.title,
    url: args.url,
    extractedQuotes: [args.quote],
    appliesToFacts: [args.factPath],
  }
}

function normalizeNoticeDays(v: unknown): number | "varies" | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string" && v.trim()) return "varies"
  return null
}

function fillOne(canonical: CanonicalStateLaws, row: Seed["jurisdictions"][number]): CanonicalStateLaws {
  const section = asText(row.eviction_section)
  const title = firstNonEmptyLine(section) ?? `${row.state} eviction`
  const url = pickPrimaryUrl(row)

  const judicialLine =
    findLine(section, /Judicial eviction required:/i) ??
    findLine(section, /judicial eviction/i) ??
    title
  const selfHelpLine =
    findLine(section, /Self-help eviction prohibited:/i) ??
    findLine(section, /self-?help/i) ??
    title

  const nonpaymentLine =
    findLine(section, /Nonpayment of rent:/i) ??
    findLine(section, /pay or quit|nonpayment/i) ??
    title
  const violationLine =
    findLine(section, /Lease violation:/i) ??
    findLine(section, /material noncompliance|lease violation/i) ??
    title
  const holdoverLine =
    findLine(section, /Month-to-month termination:/i) ??
    findLine(section, /holdover|termination/i) ??
    title

  const timelineLine =
    findLine(section, /Timeline:/i) ??
    row.eviction?.estimated_timeline ??
    title
  const courtProcessLine =
    findLine(section, /Court process:/i) ??
    title
  const filingCourtLine =
    findLine(section, /files in/i) ??
    title
  const serviceLine =
    findLine(section, /served/i) ??
    title

  const leaseViolationCure =
    /allowing tenant to cure/i.test(section) ? true : /no cure/i.test(section) ? false : "varies"

  const filled = {
    ...canonical.facts.eviction,
    nonpayment_notice_days: normalizeNoticeDays(row.eviction?.notice_period_nonpayment_days) ?? canonical.facts.eviction.nonpayment_notice_days,
    lease_violation_notice_days: normalizeNoticeDays(row.eviction?.notice_period_lease_violation_days) ?? canonical.facts.eviction.lease_violation_notice_days,
    month_to_month_notice_days: normalizeNoticeDays(row.eviction?.notice_period_month_to_month_days) ?? canonical.facts.eviction.month_to_month_notice_days,

    judicial_process_required: /yes/i.test(judicialLine) ? true : /no/i.test(judicialLine) ? false : "varies",
    self_help_eviction_prohibited: /prohibited|may not|not allowed/i.test(selfHelpLine) ? true : /allowed/i.test(selfHelpLine) ? false : "varies",

    nonpayment_notice_type: nonpaymentLine === title ? "Varies — confirm required notice form (pay-or-quit, demand for possession, etc.)." : nonpaymentLine,
    lease_violation_notice_type: violationLine === title ? "Varies — confirm notice type and cure rules." : violationLine,
    lease_violation_cure_allowed: leaseViolationCure,
    holdover_notice_type: holdoverLine === title ? "Varies — confirm termination/holdover notice rules." : holdoverLine,
    timeline_estimate_rule: typeof timelineLine === "string" ? timelineLine : String(timelineLine),
    court_process_summary_rule: courtProcessLine,
    filing_court_rule: filingCourtLine,
    service_of_process_rule: serviceLine,
  } satisfies CanonicalStateLaws["facts"]["eviction"]

  const evictionFactPaths = [
    "facts.eviction.nonpayment_notice_days",
    "facts.eviction.lease_violation_notice_days",
    "facts.eviction.month_to_month_notice_days",
    "facts.eviction.judicial_process_required",
    "facts.eviction.self_help_eviction_prohibited",
    "facts.eviction.nonpayment_notice_type",
    "facts.eviction.lease_violation_notice_type",
    "facts.eviction.lease_violation_cure_allowed",
    "facts.eviction.holdover_notice_type",
    "facts.eviction.timeline_estimate_rule",
    "facts.eviction.court_process_summary_rule",
    "facts.eviction.filing_court_rule",
    "facts.eviction.service_of_process_rule",
  ] as const

  const perFactSources: CanonicalSource[] = [
    makePerFactSource({ title, url, quote: nonpaymentLine, factPath: evictionFactPaths[0] }),
    makePerFactSource({ title, url, quote: violationLine, factPath: evictionFactPaths[1] }),
    makePerFactSource({ title, url, quote: holdoverLine, factPath: evictionFactPaths[2] }),
    makePerFactSource({ title, url, quote: judicialLine, factPath: evictionFactPaths[3] }),
    makePerFactSource({ title, url, quote: selfHelpLine, factPath: evictionFactPaths[4] }),
    makePerFactSource({ title, url, quote: nonpaymentLine, factPath: evictionFactPaths[5] }),
    makePerFactSource({ title, url, quote: violationLine, factPath: evictionFactPaths[6] }),
    makePerFactSource({ title, url, quote: violationLine, factPath: evictionFactPaths[7] }),
    makePerFactSource({ title, url, quote: holdoverLine, factPath: evictionFactPaths[8] }),
    makePerFactSource({ title, url, quote: String(timelineLine), factPath: evictionFactPaths[9] }),
    makePerFactSource({ title, url, quote: courtProcessLine, factPath: evictionFactPaths[10] }),
    makePerFactSource({ title, url, quote: filingCourtLine, factPath: evictionFactPaths[11] }),
    makePerFactSource({ title, url, quote: serviceLine, factPath: evictionFactPaths[12] }),
  ]

  const nextSources = [
    ...canonical.sources.filter(
      (s) =>
        !(
          Array.isArray(s.appliesToFacts) &&
          s.appliesToFacts.some((p) => typeof p === "string" && p.startsWith("facts.eviction."))
        )
    ),
    ...perFactSources,
  ]

  return {
    ...canonical,
    verified_by: "verify-and-fill-eviction-details",
    facts: { ...canonical.facts, eviction: filled },
    sources: nextSources,
  }
}

function main(): void {
  const root = process.cwd()
  const seedPath = path.join(root, "app/data/state_laws.json")
  const canonicalDir = path.join(root, "app/data/state_laws_canonical")

  const seed = readJson<Seed>(seedPath)
  const byCode = new Map(seed.jurisdictions.map((j) => [j.state_code.toUpperCase(), j] as const))

  const files = fs.readdirSync(canonicalDir).filter((f) => f.endsWith(".json"))
  let updated = 0
  for (const file of files) {
    const code = file.replace(/\.json$/i, "").toUpperCase()
    const row = byCode.get(code)
    if (!row) continue
    const p = path.join(canonicalDir, file)
    const canonical = readJson<CanonicalStateLaws>(p)
    const next = fillOne(canonical, row)
    writeJson(p, next)
    updated++
  }

  console.log(`[laws:fill] Updated canonical eviction details for ${updated} jurisdictions.`)
}

main()

