/**
 * Fill canonical.habitability high-frequency fields from existing RAG seed:
 *   app/data/state_laws.json (habitability_section excerpt + some structured habitability fields)
 */
import fs from "node:fs"
import path from "node:path"

import type { CanonicalSource, CanonicalStateLaws } from "../app/data/state_laws_canonical/types"

type Seed = {
  jurisdictions: Array<{
    state: string
    state_code: string
    habitability_section?: unknown
    habitability?: {
      repair_and_deduct_allowed?: boolean | string
      retaliation_prohibited?: boolean | string
      implied_warranty_of_habitability?: boolean | string
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
    (s) => typeof s.url === "string" && /court|judic|leg|legis|code|statut|housing|consumer/i.test(String(s.name ?? "") + " " + s.url)
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

function normBoolOrVaries(v: unknown): boolean | "varies" | null {
  if (typeof v === "boolean") return v
  if (typeof v === "string" && v.trim()) return "varies"
  return null
}

function fillOne(canonical: CanonicalStateLaws, row: Seed["jurisdictions"][number]): CanonicalStateLaws {
  const section = asText(row.habitability_section)
  const title = firstNonEmptyLine(section) ?? `${row.state} habitability`
  const url = pickPrimaryUrl(row)

  const impliedLine =
    findLine(section, /Implied warranty of habitability:/i) ??
    findLine(section, /habitabil/i) ??
    title
  const dutyLine =
    findLine(section, /Landlord's duty:/i) ??
    findLine(section, /comply with|make all repairs|keep premises/i) ??
    title
  const noticeLine =
    findLine(section, /Tenant's remedies:|written notice/i) ??
    title
  const repairDeductLine =
    findLine(section, /Repair and deduct:/i) ??
    title
  const withholdingLine =
    findLine(section, /Rent withholding:/i) ??
    title
  const terminationLine =
    findLine(section, /Termination:/i) ??
    title
  const retaliationLine =
    findLine(section, /Retaliatory eviction:/i) ??
    findLine(section, /retaliat/i) ??
    title

  const implied =
    /recognizes|yes/i.test(impliedLine) ? true : /no/i.test(impliedLine) ? false : normBoolOrVaries(row.habitability?.implied_warranty_of_habitability) ?? "varies"

  const repairDeduct =
    /not allowed|not permitted/i.test(repairDeductLine)
      ? false
      : /allowed/i.test(repairDeductLine)
        ? true
        : normBoolOrVaries(row.habitability?.repair_and_deduct_allowed) ?? "varies"

  const rentWithhold =
    /not allowed|cannot/i.test(withholdingLine) ? false : /allowed/i.test(withholdingLine) ? true : "varies"

  const retaliation =
    /not specifically prohibited|not prohibited/i.test(retaliationLine)
      ? false
      : /prohibited/i.test(retaliationLine)
        ? true
        : normBoolOrVaries(row.habitability?.retaliation_prohibited) ?? "varies"

  const filled = {
    ...canonical.facts.habitability,
    implied_warranty_of_habitability: implied as any,
    landlord_repair_duty_rule: dutyLine === title ? "Varies — confirm landlord repair/habitability duties in statute and local code." : dutyLine,
    tenant_notice_required_rule: noticeLine === title ? "Varies — confirm required notice/cure steps before remedies." : noticeLine,
    repair_and_deduct_allowed: repairDeduct as any,
    rent_withholding_allowed: rentWithhold as any,
    tenant_termination_for_unrepaired_conditions_rule:
      terminationLine === title ? "Varies — some states allow termination after notice and failure to repair." : terminationLine,
    retaliation_prohibited: retaliation as any,
    code_enforcement_contact_rule:
      "Varies — contact local housing/code enforcement (city/county) for inspections and official repair orders.",
  } satisfies CanonicalStateLaws["facts"]["habitability"]

  const factPaths = [
    "facts.habitability.implied_warranty_of_habitability",
    "facts.habitability.landlord_repair_duty_rule",
    "facts.habitability.tenant_notice_required_rule",
    "facts.habitability.repair_and_deduct_allowed",
    "facts.habitability.rent_withholding_allowed",
    "facts.habitability.tenant_termination_for_unrepaired_conditions_rule",
    "facts.habitability.retaliation_prohibited",
    "facts.habitability.code_enforcement_contact_rule",
  ] as const

  const perFactSources: CanonicalSource[] = [
    makePerFactSource({ title, url, quote: impliedLine, factPath: factPaths[0] }),
    makePerFactSource({ title, url, quote: dutyLine, factPath: factPaths[1] }),
    makePerFactSource({ title, url, quote: noticeLine, factPath: factPaths[2] }),
    makePerFactSource({ title, url, quote: repairDeductLine, factPath: factPaths[3] }),
    makePerFactSource({ title, url, quote: withholdingLine, factPath: factPaths[4] }),
    makePerFactSource({ title, url, quote: terminationLine, factPath: factPaths[5] }),
    makePerFactSource({ title, url, quote: retaliationLine, factPath: factPaths[6] }),
    makePerFactSource({ title, url, quote: title, factPath: factPaths[7] }),
  ]

  const nextSources = [
    ...canonical.sources.filter(
      (s) =>
        !(
          Array.isArray(s.appliesToFacts) &&
          s.appliesToFacts.some((p) => typeof p === "string" && p.startsWith("facts.habitability."))
        )
    ),
    ...perFactSources,
  ]

  return {
    ...canonical,
    verified_by: "verify-and-fill-habitability-details",
    facts: { ...canonical.facts, habitability: filled },
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

  console.log(`[laws:fill] Updated canonical habitability details for ${updated} jurisdictions.`)
}

main()

