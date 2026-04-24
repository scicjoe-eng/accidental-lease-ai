/**
 * Fill canonical.rent_increase high-frequency fields from existing RAG seed:
 *   app/data/state_laws.json (rent_increase_section excerpt + some structured rent_control fields)
 */
import fs from "node:fs"
import path from "node:path"

import type { CanonicalSource, CanonicalStateLaws } from "../app/data/state_laws_canonical/types"

type Seed = {
  jurisdictions: Array<{
    state: string
    state_code: string
    rent_increase_section?: unknown
    rent_control?: {
      statewide_rent_control?: boolean
      local_rent_control_allowed?: boolean
      rent_increase_notice_days?: number | string
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
  const section = asText(row.rent_increase_section)
  const title = firstNonEmptyLine(section) ?? `${row.state} rent increase`
  const url = pickPrimaryUrl(row)

  const rentControlLine =
    findLine(section, /Rent control:/i) ??
    title
  const noticeLine =
    findLine(section, /Notice required:/i) ??
    findLine(section, /notice/i) ??
    title
  const fixedTermLine =
    findLine(section, /Fixed-term leases:/i) ??
    title
  const increasesLine =
    findLine(section, /Rent increases:/i) ??
    title
  const justCauseLine =
    findLine(section, /Just cause:/i) ??
    title
  const deliveryLine =
    findLine(section, /written notice|deliver|served/i) ??
    title

  const statewide =
    typeof row.rent_control?.statewide_rent_control === "boolean"
      ? row.rent_control.statewide_rent_control
      : /statewide rent control/i.test(section)
        ? "varies"
        : "varies"
  const localAllowed =
    typeof row.rent_control?.local_rent_control_allowed === "boolean"
      ? row.rent_control.local_rent_control_allowed
      : /preempt|restricted/i.test(section)
        ? false
        : "varies"

  const noticeDays = normalizeNoticeDays(row.rent_control?.rent_increase_notice_days)

  const filled = {
    ...canonical.facts.rent_increase,
    notice_days: noticeDays ?? canonical.facts.rent_increase.notice_days,
    cap_rule: canonical.facts.rent_increase.cap_rule,
    statewide_rent_control: statewide as any,
    local_rent_control_allowed: localAllowed as any,
    fixed_term_increase_allowed_rule: fixedTermLine === title ? "Varies — confirm your lease terms and statute." : fixedTermLine,
    month_to_month_increase_allowed_rule: increasesLine === title ? "Varies — generally allowed with proper notice." : increasesLine,
    just_cause_required_for_increase:
      /not required/i.test(justCauseLine) ? false : /required/i.test(justCauseLine) ? true : "varies",
    delivery_method_rule: deliveryLine === title ? "Varies — confirm written notice and delivery method requirements." : deliveryLine,
    retaliation_protection_note: "Retaliation protections may limit rent increases after protected tenant complaints; confirm local/state rules.",
  } satisfies CanonicalStateLaws["facts"]["rent_increase"]

  const factPaths = [
    "facts.rent_increase.notice_days",
    "facts.rent_increase.cap_rule",
    "facts.rent_increase.statewide_rent_control",
    "facts.rent_increase.local_rent_control_allowed",
    "facts.rent_increase.fixed_term_increase_allowed_rule",
    "facts.rent_increase.month_to_month_increase_allowed_rule",
    "facts.rent_increase.just_cause_required_for_increase",
    "facts.rent_increase.delivery_method_rule",
    "facts.rent_increase.retaliation_protection_note",
  ] as const

  const perFactSources: CanonicalSource[] = [
    makePerFactSource({ title, url, quote: noticeLine, factPath: factPaths[0] }),
    makePerFactSource({ title, url, quote: rentControlLine, factPath: factPaths[1] }),
    makePerFactSource({ title, url, quote: rentControlLine, factPath: factPaths[2] }),
    makePerFactSource({ title, url, quote: rentControlLine, factPath: factPaths[3] }),
    makePerFactSource({ title, url, quote: fixedTermLine, factPath: factPaths[4] }),
    makePerFactSource({ title, url, quote: increasesLine, factPath: factPaths[5] }),
    makePerFactSource({ title, url, quote: justCauseLine, factPath: factPaths[6] }),
    makePerFactSource({ title, url, quote: deliveryLine, factPath: factPaths[7] }),
    makePerFactSource({ title, url, quote: title, factPath: factPaths[8] }),
  ]

  const nextSources = [
    ...canonical.sources.filter(
      (s) =>
        !(
          Array.isArray(s.appliesToFacts) &&
          s.appliesToFacts.some((p) => typeof p === "string" && p.startsWith("facts.rent_increase."))
        )
    ),
    ...perFactSources,
  ]

  return {
    ...canonical,
    verified_by: "verify-and-fill-rent-increase-details",
    facts: { ...canonical.facts, rent_increase: filled },
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

  console.log(`[laws:fill] Updated canonical rent increase details for ${updated} jurisdictions.`)
}

main()

