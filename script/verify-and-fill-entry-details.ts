/**
 * Fill canonical.landlord_entry high-frequency fields from existing RAG seed:
 *   app/data/state_laws.json (landlord_entry_section excerpt + some structured landlord_entry fields)
 */
import fs from "node:fs"
import path from "node:path"

import type { CanonicalSource, CanonicalStateLaws } from "../app/data/state_laws_canonical/types"

type Seed = {
  jurisdictions: Array<{
    state: string
    state_code: string
    landlord_entry_section?: unknown
    landlord_entry?: {
      notice_required?: boolean
      notice_hours?: number | string
      statutory_citation?: string
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

function fillOne(canonical: CanonicalStateLaws, row: Seed["jurisdictions"][number]): CanonicalStateLaws {
  const section = asText(row.landlord_entry_section)
  const title = firstNonEmptyLine(section) ?? `${row.state} landlord entry`
  const url = pickPrimaryUrl(row)

  const reasonableLine =
    findLine(section, /Reasonable notice required:/i) ??
    findLine(section, /reasonable notice/i) ??
    title

  const emergencyLine =
    findLine(section, /Emergency entry:/i) ??
    findLine(section, /emergency/i) ??
    title

  const repairsLine =
    findLine(section, /Entry for repairs:/i) ??
    findLine(section, /repairs?/i) ??
    title

  const showLine =
    findLine(section, /Entry to show:/i) ??
    findLine(section, /exhibit|show/i) ??
    title

  const timesLine =
    findLine(section, /Entry times:/i) ??
    findLine(section, /reasonable times/i) ??
    title

  const refuseLine =
    findLine(section, /unreasonably withhold/i) ??
    title

  const hoursFromSeed =
    typeof row.landlord_entry?.notice_hours === "number" ? row.landlord_entry.notice_hours : null

  const noticeRule: CanonicalStateLaws["facts"]["landlord_entry"]["notice_rule"] =
    hoursFromSeed != null ? "statute" : /reasonable notice/i.test(section) ? "reasonable" : "varies"

  const advanceNoticeRequired: boolean | "varies" | null =
    /notice required/i.test(section) ? true : /no notice/i.test(section) ? false : "varies"

  const emergencyAllowed: boolean | "varies" | null =
    /without notice/i.test(emergencyLine) || /emergency/i.test(emergencyLine) ? true : "varies"

  const allowedReasons =
    [repairsLine, showLine].filter((l) => l !== title).join(" ") ||
    "Varies — commonly inspections, repairs, services, and showing the unit."

  const filled = {
    ...canonical.facts.landlord_entry,
    notice_rule: noticeRule,
    typical_notice_hours: canonical.facts.landlord_entry.typical_notice_hours ?? hoursFromSeed,
    advance_notice_required: advanceNoticeRequired,
    emergency_entry_allowed: emergencyAllowed,
    allowed_entry_reasons_rule: allowedReasons,
    entry_time_window_rule: timesLine === title ? "Varies — usually at reasonable times." : timesLine,
    tenant_can_refuse_unreasonable_entry: /not unreasonably withhold/i.test(refuseLine) ? true : "varies",
    penalty_for_illegal_entry_rule: "Varies — confirm remedies (injunction, damages, attorney fees) under state law.",
  } satisfies CanonicalStateLaws["facts"]["landlord_entry"]

  const factPaths = [
    "facts.landlord_entry.notice_rule",
    "facts.landlord_entry.typical_notice_hours",
    "facts.landlord_entry.advance_notice_required",
    "facts.landlord_entry.emergency_entry_allowed",
    "facts.landlord_entry.allowed_entry_reasons_rule",
    "facts.landlord_entry.entry_time_window_rule",
    "facts.landlord_entry.tenant_can_refuse_unreasonable_entry",
    "facts.landlord_entry.penalty_for_illegal_entry_rule",
  ] as const

  const perFactSources: CanonicalSource[] = [
    makePerFactSource({ title, url, quote: reasonableLine, factPath: factPaths[0] }),
    makePerFactSource({ title, url, quote: reasonableLine, factPath: factPaths[1] }),
    makePerFactSource({ title, url, quote: reasonableLine, factPath: factPaths[2] }),
    makePerFactSource({ title, url, quote: emergencyLine, factPath: factPaths[3] }),
    makePerFactSource({ title, url, quote: allowedReasons, factPath: factPaths[4] }),
    makePerFactSource({ title, url, quote: timesLine, factPath: factPaths[5] }),
    makePerFactSource({ title, url, quote: refuseLine, factPath: factPaths[6] }),
    makePerFactSource({ title, url, quote: title, factPath: factPaths[7] }),
  ]

  const nextSources = [
    ...canonical.sources.filter(
      (s) =>
        !(
          Array.isArray(s.appliesToFacts) &&
          s.appliesToFacts.some((p) => typeof p === "string" && p.startsWith("facts.landlord_entry."))
        )
    ),
    ...perFactSources,
  ]

  return {
    ...canonical,
    verified_by: "verify-and-fill-entry-details",
    facts: { ...canonical.facts, landlord_entry: filled },
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

  console.log(`[laws:fill] Updated canonical landlord entry details for ${updated} jurisdictions.`)
}

main()

