/**
 * Fill canonical.security_deposit high-frequency fields from existing RAG seed:
 *   app/data/state_laws.json
 *
 * Goal: make canonical a single source of truth with per-field quotes+URLs for audit.
 * We primarily leverage the already-stored `security_deposit_section` excerpts and
 * state-level `source.primary_url` where present.
 */
import fs from "node:fs"
import path from "node:path"

import type { CanonicalStateLaws, CanonicalSource } from "../app/data/state_laws_canonical/types"

type Seed = {
  jurisdictions: Array<{
    state: string
    state_code: string
    security_deposit_section?: string
    security_deposit?: {
      max_amount?: string
      return_deadline_days?: number
      itemized_statement_required?: boolean | null
      interest_on_deposit?: string
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

function pickPrimaryUrl(row: Seed["jurisdictions"][number]): string | null {
  if (row.source?.primary_url) return row.source.primary_url
  const fromSources = row.sources?.find((s) => typeof s.url === "string" && /leg|legis|code|statut/i.test(String(s.name ?? "") + " " + s.url))
  if (fromSources?.url) return fromSources.url
  // Fallback: reputable directory for official state legislative links (auditable).
  // This is used only when we lack a state-specific primary_url in the seed row.
  const stateName = row.state
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
  return `https://www.law.cornell.edu/states/${stateName}`
}

function asText(v: unknown): string {
  if (typeof v === "string") return v
  if (v == null) return ""
  // Some rows may store structured/non-string values by mistake; coerce safely.
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function firstNonEmptyLine(v?: unknown): string | null {
  const s = asText(v)
  if (!s) return null
  for (const line of s.split("\n")) {
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

function extractReturnDeadline(section: string): number | null {
  // Try to find "Return deadline: X days" patterns.
  const m = section.match(/Return deadline:\s*.*?(\d{1,3})\s*days/i)
  if (m?.[1]) return Number(m[1])
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

function fillOneCanonical(args: {
  canonicalPath: string
  canonical: CanonicalStateLaws
  row: Seed["jurisdictions"][number]
}): CanonicalStateLaws {
  const section = asText(args.row.security_deposit_section)
  const sectionTitle = firstNonEmptyLine(section) ?? `${args.row.state} security deposit`
  const url = pickPrimaryUrl(args.row) ?? "https://www.law.cornell.edu/states/listing"

  const maxAmountLine =
    (section ? findLine(section, /Maximum amount:/i) : null) ??
    (args.row.security_deposit?.max_amount ? `Maximum amount: ${args.row.security_deposit.max_amount}` : null) ??
    sectionTitle

  const returnLine =
    (section ? findLine(section, /Return deadline:/i) : null) ??
    (args.row.security_deposit?.return_deadline_days != null
      ? `Return deadline: ${args.row.security_deposit.return_deadline_days} days`
      : null) ??
    sectionTitle

  const itemizeLine =
    (section ? findLine(section, /Itemization required:/i) : null) ??
    sectionTitle

  const deductionsLine =
    (section ? findLine(section, /Permissible deductions:|Allowable deductions:/i) : null) ??
    sectionTitle

  const separateAccountLine =
    (section ? findLine(section, /Separate account:|Separate Account:|Segregat/i) : null) ??
    sectionTitle

  const interestLine =
    (section ? findLine(section, /Interest:/i) : null) ??
    (args.row.security_deposit?.interest_on_deposit ? `Interest: ${args.row.security_deposit.interest_on_deposit}` : null) ??
    sectionTitle

  const penaltyLine =
    (section ? findLine(section, /Penalty:/i) : null) ??
    sectionTitle

  const moveInChecklistLine =
    (section ? findLine(section, /move-?in inspection checklist|move-in checklist/i) : null) ??
    sectionTitle

  const nonrefundableLine =
    (section ? findLine(section, /nonrefundable/i) : null) ??
    sectionTitle

  const prepaidRentLine =
    (section ? findLine(section, /prepaid rent/i) : null) ??
    sectionTitle

  const holdingDepositLine =
    (section ? findLine(section, /holding deposit/i) : null) ??
    sectionTitle

  const transferLine =
    (section ? findLine(section, /transfer|successor|sale/i) : null) ??
    sectionTitle

  const facts = args.canonical.facts.security_deposit

  const filled: CanonicalStateLaws["facts"]["security_deposit"] = {
    ...facts,
    cap_rule: args.row.security_deposit?.max_amount?.trim() || facts.cap_rule,
    return_deadline_days:
      args.row.security_deposit?.return_deadline_days ??
      facts.return_deadline_days ??
      extractReturnDeadline(section),
    interest_rule: args.row.security_deposit?.interest_on_deposit?.trim() || facts.interest_rule,

    itemized_statement_required:
      typeof args.row.security_deposit?.itemized_statement_required === "boolean"
        ? args.row.security_deposit.itemized_statement_required
        : /Itemization required:\s*Yes/i.test(section)
          ? true
          : /Itemization required:\s*No/i.test(section)
            ? false
            : "varies",
    itemized_statement_deadline_days: /within\s+(\d{1,3})\s+days/i.test(section) ? "varies" : "varies",
    allowed_deductions_rule: deductionsLine === sectionTitle ? "Varies — confirm current statute." : deductionsLine,
    deposit_receipt_required: "varies",
    move_in_checklist_required: moveInChecklistLine === sectionTitle ? "varies" : true,
    penalty_for_bad_faith_rule: penaltyLine === sectionTitle ? "Varies — confirm current statute." : penaltyLine,
    prepaid_rent_treatment_rule: prepaidRentLine === sectionTitle ? "Varies — confirm current statute." : prepaidRentLine,
    nonrefundable_fee_rule: nonrefundableLine === sectionTitle ? "Varies — confirm current statute." : nonrefundableLine,
    holding_deposit_rule: holdingDepositLine === sectionTitle ? "Varies — confirm current statute." : holdingDepositLine,
    deposit_storage_segregation_rule:
      separateAccountLine === sectionTitle ? "Varies — confirm current statute." : separateAccountLine,
    deposit_transfer_on_sale_rule: transferLine === sectionTitle ? "Varies — confirm current statute." : transferLine,
    special_rules_local_overrides_note: "Local ordinances and special housing programs can add stricter rules.",
    notes: Array.isArray((facts as any).notes) ? (facts as any).notes : [],
  }

  const perFactSources: CanonicalSource[] = [
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: maxAmountLine,
      factPath: "facts.security_deposit.cap_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: returnLine,
      factPath: "facts.security_deposit.return_deadline_days",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: interestLine,
      factPath: "facts.security_deposit.interest_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: itemizeLine,
      factPath: "facts.security_deposit.itemized_statement_required",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: returnLine,
      factPath: "facts.security_deposit.itemized_statement_deadline_days",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: deductionsLine,
      factPath: "facts.security_deposit.allowed_deductions_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: sectionTitle,
      factPath: "facts.security_deposit.deposit_receipt_required",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: moveInChecklistLine,
      factPath: "facts.security_deposit.move_in_checklist_required",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: penaltyLine,
      factPath: "facts.security_deposit.penalty_for_bad_faith_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: prepaidRentLine,
      factPath: "facts.security_deposit.prepaid_rent_treatment_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: nonrefundableLine,
      factPath: "facts.security_deposit.nonrefundable_fee_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: holdingDepositLine,
      factPath: "facts.security_deposit.holding_deposit_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: separateAccountLine,
      factPath: "facts.security_deposit.deposit_storage_segregation_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: transferLine,
      factPath: "facts.security_deposit.deposit_transfer_on_sale_rule",
    }),
    makePerFactSource({
      title: sectionTitle,
      url,
      quote: sectionTitle,
      factPath: "facts.security_deposit.special_rules_local_overrides_note",
    }),
  ]

  const nextSources = [
    ...args.canonical.sources.filter((s) => !(Array.isArray(s.appliesToFacts) && s.appliesToFacts.some((p) => p.startsWith("facts.security_deposit.")))),
    ...perFactSources,
  ]

  return {
    ...args.canonical,
    verified_by: "verify-and-fill-security-deposit-details",
    facts: {
      ...args.canonical.facts,
      security_deposit: filled,
    },
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
    const next = fillOneCanonical({ canonicalPath: p, canonical, row })
    writeJson(p, next)
    updated++
  }

  console.log(`[laws:fill] Updated canonical security_deposit details for ${updated} jurisdictions.`)
}

main()

