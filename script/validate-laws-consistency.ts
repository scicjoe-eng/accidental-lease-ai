/**
 * Validate that canonical facts match generated outputs:
 *  - app/data/states/*.json bullets
 *  - app/data/state_laws.json structured fields (security_deposit / eviction / rent_control / landlord_entry)
 */
import fs from "node:fs"
import path from "node:path"

import type { CanonicalStateLaws } from "../app/data/state_laws_canonical/types"
import type { StateLawPage } from "../app/data/states/types"

type Seed = {
  jurisdictions?: Array<Record<string, unknown>>
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T
}

function loadCanonical(canonicalDir: string): CanonicalStateLaws[] {
  const files = fs.readdirSync(canonicalDir).filter((f) => f.toLowerCase().endsWith(".json"))
  return files.map((f) => readJson<CanonicalStateLaws>(path.join(canonicalDir, f)))
}

function fail(msg: string): never {
  throw new Error(msg)
}

function findSection(page: StateLawPage, heading: string) {
  return page.sections.find((s) => s.level === "h2" && s.heading.trim() === heading)
}

function main(): void {
  const root = process.cwd()
  const canonicalDir = path.join(root, "app/data/state_laws_canonical")
  const statesDir = path.join(root, "app/data/states")
  const seedPath = path.join(root, "app/data/state_laws.json")

  const canon = loadCanonical(canonicalDir)
  if (canon.length < 51) {
    fail(`[laws:validate] canonical count < 51: ${canon.length}`)
  }

  const seed = readJson<Seed>(seedPath)
  const jurisdictions = Array.isArray(seed.jurisdictions) ? seed.jurisdictions : []
  if (jurisdictions.length < 51) {
    fail(`[laws:validate] state_laws.json jurisdictions < 51: ${jurisdictions.length}`)
  }
  const seedByCode = new Map(
    jurisdictions.map((j) => [String(j.state_code ?? "").trim().toUpperCase(), j] as const)
  )

  let issues = 0
  const requiredDepositFactPaths = [
    "facts.security_deposit.cap_rule",
    "facts.security_deposit.return_deadline_days",
    "facts.security_deposit.interest_rule",
    "facts.security_deposit.itemized_statement_required",
    "facts.security_deposit.itemized_statement_deadline_days",
    "facts.security_deposit.allowed_deductions_rule",
    "facts.security_deposit.deposit_receipt_required",
    "facts.security_deposit.move_in_checklist_required",
    "facts.security_deposit.penalty_for_bad_faith_rule",
    "facts.security_deposit.prepaid_rent_treatment_rule",
    "facts.security_deposit.nonrefundable_fee_rule",
    "facts.security_deposit.holding_deposit_rule",
    "facts.security_deposit.deposit_storage_segregation_rule",
    "facts.security_deposit.deposit_transfer_on_sale_rule",
    "facts.security_deposit.special_rules_local_overrides_note",
  ] as const
  const requiredEvictionFactPaths = [
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
  const requiredEntryFactPaths = [
    "facts.landlord_entry.notice_rule",
    "facts.landlord_entry.typical_notice_hours",
    "facts.landlord_entry.advance_notice_required",
    "facts.landlord_entry.emergency_entry_allowed",
    "facts.landlord_entry.allowed_entry_reasons_rule",
    "facts.landlord_entry.entry_time_window_rule",
    "facts.landlord_entry.tenant_can_refuse_unreasonable_entry",
    "facts.landlord_entry.penalty_for_illegal_entry_rule",
  ] as const
  const requiredRentIncreaseFactPaths = [
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
  const requiredHabitabilityFactPaths = [
    "facts.habitability.implied_warranty_of_habitability",
    "facts.habitability.landlord_repair_duty_rule",
    "facts.habitability.tenant_notice_required_rule",
    "facts.habitability.repair_and_deduct_allowed",
    "facts.habitability.rent_withholding_allowed",
    "facts.habitability.tenant_termination_for_unrepaired_conditions_rule",
    "facts.habitability.retaliation_prohibited",
    "facts.habitability.code_enforcement_contact_rule",
  ] as const

  for (const c of canon) {
    const pagePath = path.join(statesDir, `${c.state_slug}.json`)
    if (!fs.existsSync(pagePath)) {
      console.error("[laws:validate] missing page json:", c.state_code, pagePath)
      issues++
      continue
    }
    const page = readJson<StateLawPage>(pagePath)

    // Coverage + citation checks for security deposit facts.
    for (const factPath of requiredDepositFactPaths) {
      const hasSource = c.sources.some(
        (s) =>
          Array.isArray((s as any).appliesToFacts) &&
          (s as any).appliesToFacts.includes(factPath) &&
          Array.isArray((s as any).extractedQuotes) &&
          (s as any).extractedQuotes.length > 0 &&
          typeof (s as any).url === "string" &&
          (s as any).url.length > 0
      )
      if (!hasSource) {
        console.error("[laws:validate] missing per-fact source/quote/url:", c.state_code, factPath)
        issues++
      }
    }

    // Coverage + citation checks for eviction facts.
    for (const factPath of requiredEvictionFactPaths) {
      const hasSource = c.sources.some(
        (s) =>
          Array.isArray((s as any).appliesToFacts) &&
          (s as any).appliesToFacts.includes(factPath) &&
          Array.isArray((s as any).extractedQuotes) &&
          (s as any).extractedQuotes.length > 0 &&
          typeof (s as any).url === "string" &&
          (s as any).url.length > 0
      )
      if (!hasSource) {
        console.error("[laws:validate] missing per-fact source/quote/url:", c.state_code, factPath)
        issues++
      }
    }

    // Coverage + citation checks for entry facts.
    for (const factPath of requiredEntryFactPaths) {
      const hasSource = c.sources.some(
        (s) =>
          Array.isArray((s as any).appliesToFacts) &&
          (s as any).appliesToFacts.includes(factPath) &&
          Array.isArray((s as any).extractedQuotes) &&
          (s as any).extractedQuotes.length > 0 &&
          typeof (s as any).url === "string" &&
          (s as any).url.length > 0
      )
      if (!hasSource) {
        console.error("[laws:validate] missing per-fact source/quote/url:", c.state_code, factPath)
        issues++
      }
    }

    // Coverage + citation checks for rent increase facts.
    for (const factPath of requiredRentIncreaseFactPaths) {
      const hasSource = c.sources.some(
        (s) =>
          Array.isArray((s as any).appliesToFacts) &&
          (s as any).appliesToFacts.includes(factPath) &&
          Array.isArray((s as any).extractedQuotes) &&
          (s as any).extractedQuotes.length > 0 &&
          typeof (s as any).url === "string" &&
          (s as any).url.length > 0
      )
      if (!hasSource) {
        console.error("[laws:validate] missing per-fact source/quote/url:", c.state_code, factPath)
        issues++
      }
    }

    // Coverage + citation checks for habitability facts.
    for (const factPath of requiredHabitabilityFactPaths) {
      const hasSource = c.sources.some(
        (s) =>
          Array.isArray((s as any).appliesToFacts) &&
          (s as any).appliesToFacts.includes(factPath) &&
          Array.isArray((s as any).extractedQuotes) &&
          (s as any).extractedQuotes.length > 0 &&
          typeof (s as any).url === "string" &&
          (s as any).url.length > 0
      )
      if (!hasSource) {
        console.error("[laws:validate] missing per-fact source/quote/url:", c.state_code, factPath)
        issues++
      }
    }

    // Bullet checks (lightweight; just ensure canonical appears in bullets).
    const sec = findSection(page, "Security deposit rules")
    const bullets = sec?.bullets ?? []
    if (!bullets.some((b) => b.includes(`Deposit cap:`))) {
      console.error("[laws:validate] missing deposit cap bullet:", c.state_code)
      issues++
    }
    if (!bullets.some((b) => b.includes(String(c.facts.security_deposit.return_deadline_days ?? "")))) {
      // Allow null/varies
      if (c.facts.security_deposit.return_deadline_days != null) {
        console.error(
          "[laws:validate] deposit deadline mismatch:",
          c.state_code,
          "expected days:",
          c.facts.security_deposit.return_deadline_days
        )
        issues++
      }
    }

    // Seed structured checks: ensure no self-contradiction for the core numbers.
    const seedRow = seedByCode.get(c.state_code)
    if (!seedRow) {
      console.error("[laws:validate] missing seed row:", c.state_code)
      issues++
      continue
    }

    const seedSec = (seedRow.security_deposit ?? {}) as Record<string, unknown>
    const seedReturn = seedSec.return_deadline_days
    if (
      typeof c.facts.security_deposit.return_deadline_days === "number" &&
      typeof seedReturn === "number" &&
      seedReturn !== c.facts.security_deposit.return_deadline_days
    ) {
      console.error(
        "[laws:validate] seed return_deadline_days mismatch:",
        c.state_code,
        "seed:",
        seedReturn,
        "canonical:",
        c.facts.security_deposit.return_deadline_days
      )
      issues++
    }

    // WA regression guard: if the seed statutory excerpt contains "Within 30 days" but structured is 14 etc.
    if (c.state_code === "WA") {
      const excerpt = String(seedRow.security_deposit_section ?? "")
      if (/within\s+30\s+days/i.test(excerpt) && seedReturn !== 30) {
        console.error("[laws:validate] WA self-contradiction: excerpt says 30, structured is", seedReturn)
        issues++
      }
    }
  }

  if (issues > 0) {
    fail(`[laws:validate] FAILED with ${issues} issue(s).`)
  }
  console.log("[laws:validate] OK")
}

main()

