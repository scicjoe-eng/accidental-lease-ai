/**
 * Canonical pipeline:
 *   app/data/state_laws_canonical/*.json
 *     -> refresh app/data/states/*.json (SEO pages)
 *     -> refresh app/data/state_laws.json (RAG seed dataset, used by import-laws)
 *
 * This keeps page JSON and RAG dataset consistent and eliminates drift.
 */
import fs from "node:fs"
import path from "node:path"

import type { CanonicalStateLaws } from "../app/data/state_laws_canonical/types"
import type { StateLawPage } from "../app/data/states/types"

type ExistingSeed = {
  metadata?: Record<string, unknown>
  jurisdictions?: Array<Record<string, unknown>>
}

function readJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T
}

function writeJson(p: string, data: unknown): void {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8")
}

function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true })
}

function slugifyStateName(name: string): string {
  if (name === "District of Columbia") return "district-of-columbia"
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function toTitleCaseWords(s: string): string {
  return s
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ")
}

function canonicalFileName(code: string): string {
  return `${code.trim().toUpperCase()}.json`
}

function normalizeCanonical(c: CanonicalStateLaws): CanonicalStateLaws {
  const safeNotes = (v: unknown): string[] | undefined =>
    Array.isArray(v) && v.every((x) => typeof x === "string") ? (v as string[]) : undefined

  const facts: CanonicalStateLaws["facts"] = {
    ...c.facts,
    security_deposit: {
      ...c.facts.security_deposit,
      notes: safeNotes((c.facts.security_deposit as any).notes),
      itemized_statement_required:
        (c.facts.security_deposit as any).itemized_statement_required ?? "varies",
      itemized_statement_deadline_days:
        (c.facts.security_deposit as any).itemized_statement_deadline_days ?? "varies",
      allowed_deductions_rule:
        (c.facts.security_deposit as any).allowed_deductions_rule ??
        "Varies — confirm current statute.",
      deposit_receipt_required:
        (c.facts.security_deposit as any).deposit_receipt_required ?? "varies",
      move_in_checklist_required:
        (c.facts.security_deposit as any).move_in_checklist_required ?? "varies",
      penalty_for_bad_faith_rule:
        (c.facts.security_deposit as any).penalty_for_bad_faith_rule ??
        "Varies — confirm current statute.",
      prepaid_rent_treatment_rule:
        (c.facts.security_deposit as any).prepaid_rent_treatment_rule ??
        "Varies — confirm current statute.",
      nonrefundable_fee_rule:
        (c.facts.security_deposit as any).nonrefundable_fee_rule ??
        "Varies — confirm current statute.",
      holding_deposit_rule:
        (c.facts.security_deposit as any).holding_deposit_rule ??
        "Varies — confirm current statute.",
      deposit_storage_segregation_rule:
        (c.facts.security_deposit as any).deposit_storage_segregation_rule ??
        "Varies — confirm current statute.",
      deposit_transfer_on_sale_rule:
        (c.facts.security_deposit as any).deposit_transfer_on_sale_rule ??
        "Varies — confirm current statute.",
      special_rules_local_overrides_note:
        (c.facts.security_deposit as any).special_rules_local_overrides_note ??
        "Local ordinances and special housing programs can add stricter rules.",
    },
    eviction: {
      ...c.facts.eviction,
      notes: safeNotes((c.facts.eviction as any).notes),
      judicial_process_required:
        (c.facts.eviction as any).judicial_process_required ?? "varies",
      self_help_eviction_prohibited:
        (c.facts.eviction as any).self_help_eviction_prohibited ?? "varies",
      nonpayment_notice_type:
        (c.facts.eviction as any).nonpayment_notice_type ??
        "Varies — confirm required notice form (pay-or-quit, demand for possession, etc.).",
      lease_violation_notice_type:
        (c.facts.eviction as any).lease_violation_notice_type ??
        "Varies — confirm notice type and cure rules.",
      lease_violation_cure_allowed:
        (c.facts.eviction as any).lease_violation_cure_allowed ?? "varies",
      holdover_notice_type:
        (c.facts.eviction as any).holdover_notice_type ??
        "Varies — confirm termination/holdover notice rules.",
      timeline_estimate_rule:
        (c.facts.eviction as any).timeline_estimate_rule ??
        "Varies by county/court calendars and defenses.",
      court_process_summary_rule:
        (c.facts.eviction as any).court_process_summary_rule ??
        "Varies — confirm court steps in your county (filing, service, hearing, judgment, writ).",
      filing_court_rule:
        (c.facts.eviction as any).filing_court_rule ?? "Varies — confirm the correct court for eviction filings.",
      service_of_process_rule:
        (c.facts.eviction as any).service_of_process_rule ?? "Varies — confirm service rules and proof requirements.",
    },
    landlord_entry: {
      ...c.facts.landlord_entry,
      notes: safeNotes((c.facts.landlord_entry as any).notes),
      advance_notice_required:
        (c.facts.landlord_entry as any).advance_notice_required ?? "varies",
      emergency_entry_allowed:
        (c.facts.landlord_entry as any).emergency_entry_allowed ?? "varies",
      allowed_entry_reasons_rule:
        (c.facts.landlord_entry as any).allowed_entry_reasons_rule ??
        "Varies — commonly inspections, repairs, services, and showing the unit.",
      entry_time_window_rule:
        (c.facts.landlord_entry as any).entry_time_window_rule ??
        "Varies — usually at reasonable times.",
      tenant_can_refuse_unreasonable_entry:
        (c.facts.landlord_entry as any).tenant_can_refuse_unreasonable_entry ??
        "varies",
      penalty_for_illegal_entry_rule:
        (c.facts.landlord_entry as any).penalty_for_illegal_entry_rule ??
        "Varies — confirm remedies under state law.",
    },
    rent_increase: {
      ...c.facts.rent_increase,
      notes: safeNotes((c.facts.rent_increase as any).notes),
      statewide_rent_control:
        (c.facts.rent_increase as any).statewide_rent_control ?? "varies",
      local_rent_control_allowed:
        (c.facts.rent_increase as any).local_rent_control_allowed ?? "varies",
      fixed_term_increase_allowed_rule:
        (c.facts.rent_increase as any).fixed_term_increase_allowed_rule ??
        "Varies — rent usually cannot be changed mid-lease unless the lease allows it.",
      month_to_month_increase_allowed_rule:
        (c.facts.rent_increase as any).month_to_month_increase_allowed_rule ??
        "Varies — generally allowed with proper notice.",
      just_cause_required_for_increase:
        (c.facts.rent_increase as any).just_cause_required_for_increase ?? "varies",
      delivery_method_rule:
        (c.facts.rent_increase as any).delivery_method_rule ??
        "Varies — confirm written notice and delivery method requirements.",
      retaliation_protection_note:
        (c.facts.rent_increase as any).retaliation_protection_note ??
        "Retaliation protections may apply; confirm local/state rules.",
    },
    habitability: {
      ...c.facts.habitability,
      notes: safeNotes((c.facts.habitability as any).notes),
      implied_warranty_of_habitability:
        (c.facts.habitability as any).implied_warranty_of_habitability ?? "varies",
      landlord_repair_duty_rule:
        (c.facts.habitability as any).landlord_repair_duty_rule ??
        "Varies — confirm landlord duties to maintain safe/habitable premises.",
      tenant_notice_required_rule:
        (c.facts.habitability as any).tenant_notice_required_rule ??
        "Varies — confirm notice/cure steps required before remedies.",
      repair_and_deduct_allowed:
        (c.facts.habitability as any).repair_and_deduct_allowed ?? "varies",
      rent_withholding_allowed:
        (c.facts.habitability as any).rent_withholding_allowed ?? "varies",
      tenant_termination_for_unrepaired_conditions_rule:
        (c.facts.habitability as any).tenant_termination_for_unrepaired_conditions_rule ??
        "Varies — confirm termination rights after notice and failure to repair.",
      retaliation_prohibited:
        (c.facts.habitability as any).retaliation_prohibited ?? "varies",
      code_enforcement_contact_rule:
        (c.facts.habitability as any).code_enforcement_contact_rule ??
        "Varies — contact local housing/code enforcement for inspections.",
    },
  }

  const narrative =
    c.narrative && typeof c.narrative.summary === "string"
      ? {
          summary: c.narrative.summary,
          bullets: Array.isArray(c.narrative.bullets)
            ? c.narrative.bullets.filter((x) => typeof x === "string")
            : undefined,
        }
      : undefined

  return { ...c, facts, narrative }
}

function loadCanonicalAll(canonicalDir: string): CanonicalStateLaws[] {
  const files = fs
    .readdirSync(canonicalDir)
    .filter((f) => f.toLowerCase().endsWith(".json"))
  const items: CanonicalStateLaws[] = []
  for (const f of files) {
    const p = path.join(canonicalDir, f)
    const raw = readJson<CanonicalStateLaws>(p)
    const normalized = normalizeCanonical(raw)

    // Backfill new optional fields into canonical files so they stay future-proof.
    const rawStr = JSON.stringify(raw)
    const normalizedStr = JSON.stringify(normalized)
    if (rawStr !== normalizedStr) {
      writeJson(p, normalized)
    }

    items.push(normalized)
  }
  items.sort((a, b) => a.state_name.localeCompare(b.state_name))
  return items
}

/**
 * Bootstrap canonical files from current app/data/state_laws.json if canonical is empty.
 * This is a one-time convenience; after that, canonical is the only place to edit.
 */
function bootstrapCanonicalIfMissing(args: {
  canonicalDir: string
  seedPath: string
}): void {
  ensureDir(args.canonicalDir)
  const existing = fs
    .readdirSync(args.canonicalDir)
    .filter((f) => f.toLowerCase().endsWith(".json"))
  if (existing.length > 0) return

  const seed = readJson<ExistingSeed>(args.seedPath)
  const jurisdictions = seed.jurisdictions
  if (!Array.isArray(jurisdictions)) {
    throw new Error("state_laws.json missing jurisdictions[]")
  }

  const nowIso = new Date().toISOString().slice(0, 10)
  for (const row of jurisdictions) {
    const state_name = String(row.state ?? "").trim()
    const state_code = String(row.state_code ?? "").trim().toUpperCase()
    if (!state_name || !/^[A-Z]{2}$/.test(state_code)) continue

    const sec = (row.security_deposit ?? {}) as Record<string, unknown>
    const ev = (row.eviction ?? {}) as Record<string, unknown>
    const entry = (row.landlord_entry ?? {}) as Record<string, unknown>
    const rc = (row.rent_control ?? {}) as Record<string, unknown>

    const cap_rule =
      typeof sec.max_amount === "string" && sec.max_amount.trim()
        ? sec.max_amount.trim()
        : "Varies — confirm current statute and local rules."

    const return_deadline_days =
      typeof sec.return_deadline_days === "number" ? sec.return_deadline_days : null

    const interest_rule =
      typeof sec.interest_on_deposit === "string" && sec.interest_on_deposit.trim()
        ? sec.interest_on_deposit.trim()
        : "Varies — confirm current statute."

    const canonical: CanonicalStateLaws = {
      state_code,
      state_name,
      state_slug: slugifyStateName(state_name),
      last_verified_at: nowIso,
      verified_by: "bootstrap-from-state_laws.json",
      facts: {
        security_deposit: {
          cap_rule,
          return_deadline_days,
          interest_rule,
          itemized_statement_required: "varies",
          itemized_statement_deadline_days: "varies",
          allowed_deductions_rule: "Varies — confirm current statute.",
          deposit_receipt_required: "varies",
          move_in_checklist_required: "varies",
          penalty_for_bad_faith_rule: "Varies — confirm current statute.",
          prepaid_rent_treatment_rule: "Varies — confirm current statute.",
          nonrefundable_fee_rule: "Varies — confirm current statute.",
          holding_deposit_rule: "Varies — confirm current statute.",
          deposit_storage_segregation_rule: "Varies — confirm current statute.",
          deposit_transfer_on_sale_rule: "Varies — confirm current statute.",
          special_rules_local_overrides_note: "Local ordinances and special housing programs can add stricter rules.",
          notes: [],
        },
        eviction: {
          nonpayment_notice_days:
            typeof ev.notice_period_nonpayment_days === "number"
              ? ev.notice_period_nonpayment_days
              : typeof ev.notice_period_nonpayment_days === "string"
                ? "varies"
                : null,
          lease_violation_notice_days:
            typeof ev.notice_period_lease_violation_days === "number"
              ? ev.notice_period_lease_violation_days
              : typeof ev.notice_period_lease_violation_days === "string"
                ? "varies"
                : null,
          month_to_month_notice_days:
            typeof ev.notice_period_month_to_month_days === "number"
              ? ev.notice_period_month_to_month_days
              : typeof ev.notice_period_month_to_month_days === "string"
                ? "varies"
                : null,
          judicial_process_required: "varies",
          self_help_eviction_prohibited: "varies",
          nonpayment_notice_type:
            "Varies — confirm required notice form (pay-or-quit, demand for possession, etc.).",
          lease_violation_notice_type: "Varies — confirm notice type and cure rules.",
          lease_violation_cure_allowed: "varies",
          holdover_notice_type: "Varies — confirm termination/holdover notice rules.",
          timeline_estimate_rule: "Varies by county/court calendars and defenses.",
          court_process_summary_rule:
            "Varies — confirm court steps in your county (filing, service, hearing, judgment, writ).",
          filing_court_rule: "Varies — confirm the correct court for eviction filings.",
          service_of_process_rule: "Varies — confirm service rules and proof requirements.",
          notes: [],
        },
        landlord_entry: {
          notice_rule:
            typeof entry.notice_hours === "number" ? "statute" : "varies",
          typical_notice_hours:
            typeof entry.notice_hours === "number" ? entry.notice_hours : null,
          advance_notice_required: "varies",
          emergency_entry_allowed: "varies",
          allowed_entry_reasons_rule:
            "Varies — commonly inspections, repairs, services, and showing the unit.",
          entry_time_window_rule: "Varies — usually at reasonable times.",
          tenant_can_refuse_unreasonable_entry: "varies",
          penalty_for_illegal_entry_rule: "Varies — confirm remedies under state law.",
          notes: [],
        },
        rent_increase: {
          notice_days:
            typeof rc.rent_increase_notice_days === "number"
              ? rc.rent_increase_notice_days
              : typeof rc.rent_increase_notice_days === "string"
                ? "varies"
                : null,
          cap_rule:
            rc.statewide_rent_control === true
              ? "Statewide rent control applies (coverage varies)."
              : "No statewide rent control; local rules may apply.",
          statewide_rent_control:
            typeof rc.statewide_rent_control === "boolean" ? rc.statewide_rent_control : "varies",
          local_rent_control_allowed:
            typeof rc.local_rent_control_allowed === "boolean" ? rc.local_rent_control_allowed : "varies",
          fixed_term_increase_allowed_rule:
            "Varies — rent usually cannot be increased mid-lease unless the lease allows it.",
          month_to_month_increase_allowed_rule: "Varies — generally allowed with proper notice.",
          just_cause_required_for_increase: "varies",
          delivery_method_rule: "Varies — confirm written notice and delivery method requirements.",
          retaliation_protection_note:
            "Retaliation protections may apply; confirm local/state rules.",
          notes: [],
        },
        habitability: {
          implied_warranty_of_habitability: "varies",
          landlord_repair_duty_rule: "Varies — confirm landlord duties to maintain safe/habitable premises.",
          tenant_notice_required_rule: "Varies — confirm notice/cure steps required before remedies.",
          repair_and_deduct_allowed: "varies",
          rent_withholding_allowed: "varies",
          tenant_termination_for_unrepaired_conditions_rule:
            "Varies — confirm termination rights after notice and failure to repair.",
          retaliation_prohibited: "varies",
          code_enforcement_contact_rule:
            "Varies — contact local housing/code enforcement for inspections.",
          notes: [],
        },
      },
      sources: [
        {
          type: "other",
          title: "Bootstrapped from app/data/state_laws.json",
          url: "app/data/state_laws.json",
        },
      ],
      narrative: {
        summary: `${toTitleCaseWords(state_name)} landlord-tenant law overview for accidental landlords (deposits, eviction notices, entry rules, rent increases).`,
        bullets: [],
      },
    }

    writeJson(path.join(args.canonicalDir, canonicalFileName(state_code)), canonical)
  }
}

function updateStatePageFromCanonical(page: StateLawPage, c: CanonicalStateLaws): StateLawPage {
  const sections = page.sections.map((s) => {
    if (s.level !== "h2" || !Array.isArray(s.bullets)) return s
    const heading = s.heading.trim().toLowerCase()

    if (heading === "security deposit rules") {
      const itemized =
        c.facts.security_deposit.itemized_statement_required === true
          ? "Itemized statement: required if deductions are taken (check deadlines and delivery method)."
          : c.facts.security_deposit.itemized_statement_required === false
            ? "Itemized statement: not always required by statewide statute; confirm your lease and local rules."
            : "Itemized statement: varies — confirm current statute and local rules."
      const bullets = [
        `Deposit cap: ${c.facts.security_deposit.cap_rule}`,
        c.facts.security_deposit.return_deadline_days != null
          ? `Return deadline: ${c.facts.security_deposit.return_deadline_days} days after move-out/tenancy end (deductions can affect details).`
          : "Return deadline: varies — confirm current statute and local rules.",
        itemized,
        `Deductions: ${c.facts.security_deposit.allowed_deductions_rule}`,
        `Penalty risk: ${c.facts.security_deposit.penalty_for_bad_faith_rule}`,
        `Interest: ${c.facts.security_deposit.interest_rule}`,
      ]
      return { ...s, bullets }
    }

    if (heading === "eviction notice requirements") {
      const nonpayment =
        typeof c.facts.eviction.nonpayment_notice_days === "number"
          ? `Nonpayment notice: commonly ${c.facts.eviction.nonpayment_notice_days} days (verify by tenancy type/notice form).`
          : "Nonpayment notice: varies — confirm current statute and required notice form."
      const violation =
        typeof c.facts.eviction.lease_violation_notice_days === "number"
          ? `Lease violation notice: commonly ${c.facts.eviction.lease_violation_notice_days} days (may allow cure).`
          : "Lease violation notice: varies — confirm cure rights and timelines."
      const m2m =
        typeof c.facts.eviction.month_to_month_notice_days === "number"
          ? `Month-to-month termination: commonly ${c.facts.eviction.month_to_month_notice_days} days (verify tenancy type).`
          : "Month-to-month termination: varies by tenancy type and local rules."
      const judicial =
        c.facts.eviction.judicial_process_required === true
          ? "Court process: judicial eviction required (no self-help)."
          : c.facts.eviction.judicial_process_required === false
            ? "Court process: confirm whether judicial eviction is required (most states prohibit self-help)."
            : "Court process: varies — confirm court process requirements and exceptions."
      const selfHelp =
        c.facts.eviction.self_help_eviction_prohibited === true
          ? "Self-help eviction: prohibited (generally requires a court order)."
          : c.facts.eviction.self_help_eviction_prohibited === false
            ? "Self-help eviction: confirm whether any self-help is permitted (often risky/limited)."
            : "Self-help eviction: varies — confirm current statute and case law."
      const bullets = [
        nonpayment,
        `Nonpayment notice type: ${c.facts.eviction.nonpayment_notice_type}`,
        violation,
        `Lease violation notice type: ${c.facts.eviction.lease_violation_notice_type}`,
        `Cure allowed: ${
          c.facts.eviction.lease_violation_cure_allowed === true
            ? "often yes (depends on violation)"
            : c.facts.eviction.lease_violation_cure_allowed === false
              ? "often no (for certain violations)"
              : "varies"
        }`,
        m2m,
        `Holdover/termination notice type: ${c.facts.eviction.holdover_notice_type}`,
        judicial,
        selfHelp,
        `Timeline: ${c.facts.eviction.timeline_estimate_rule}`,
        `Court steps: ${c.facts.eviction.court_process_summary_rule}`,
      ]
      return { ...s, bullets }
    }

    if (heading === "landlord entry notice") {
      const bullets = [
        c.facts.landlord_entry.notice_rule === "statute"
          ? "Notice: statutory notice is required for most non-emergency entries."
          : "Notice: often governed by lease terms and a reasonableness standard (state law may not set a single hour-count).",
        c.facts.landlord_entry.typical_notice_hours != null
          ? `Typical notice time: ${c.facts.landlord_entry.typical_notice_hours} hours (unless lease/statute differs).`
          : "Typical notice time: varies; many leases use 24 hours as a practical baseline.",
        `Allowed reasons: ${c.facts.landlord_entry.allowed_entry_reasons_rule}`,
        `Timing: ${c.facts.landlord_entry.entry_time_window_rule}`,
        c.facts.landlord_entry.emergency_entry_allowed === true
          ? "Emergencies: generally allow entry without advance notice."
          : c.facts.landlord_entry.emergency_entry_allowed === false
            ? "Emergencies: confirm whether emergency entry is allowed without notice."
            : "Emergencies: varies — confirm emergency exceptions.",
        `Tenant refusal: ${
          c.facts.landlord_entry.tenant_can_refuse_unreasonable_entry === true
            ? "tenant cannot unreasonably withhold consent"
            : c.facts.landlord_entry.tenant_can_refuse_unreasonable_entry === false
              ? "tenant may refuse some entries (confirm specifics)"
              : "varies"
        }`,
        `Remedies/penalties: ${c.facts.landlord_entry.penalty_for_illegal_entry_rule}`,
      ]
      return { ...s, bullets }
    }

    if (heading === "rent increase rules") {
      const notice =
        typeof c.facts.rent_increase.notice_days === "number"
          ? `Notice of rent increase: commonly ${c.facts.rent_increase.notice_days} days' written notice for month-to-month tenancies.`
          : "Notice of rent increase: varies — confirm current statute and any local ordinances."
      const bullets = [
        c.facts.rent_increase.cap_rule.includes("Statewide rent control")
          ? "Statewide rent control: exists (coverage and cap formulas vary)."
          : "Statewide rent control: typically none, but local/covered-housing rules may apply.",
        "Local rent control: may exist in certain cities/counties (check if your property is covered).",
        notice,
        `Fixed-term leases: ${c.facts.rent_increase.fixed_term_increase_allowed_rule}`,
        `Month-to-month: ${c.facts.rent_increase.month_to_month_increase_allowed_rule}`,
        `Delivery: ${c.facts.rent_increase.delivery_method_rule}`,
        `Just cause: ${
          c.facts.rent_increase.just_cause_required_for_increase === true
            ? "required in some covered situations"
            : c.facts.rent_increase.just_cause_required_for_increase === false
              ? "not required"
              : "varies"
        }`,
        `Retaliation: ${c.facts.rent_increase.retaliation_protection_note}`,
      ]
      return { ...s, bullets }
    }

    if (heading === "tenant rights & habitability basics") {
      const bullets = [
        `Habitability: ${
          c.facts.habitability.implied_warranty_of_habitability === true
            ? "implied warranty generally applies"
            : c.facts.habitability.implied_warranty_of_habitability === false
              ? "confirm whether an implied warranty applies"
              : "varies — confirm current law"
        }`,
        `Landlord repair duty: ${c.facts.habitability.landlord_repair_duty_rule}`,
        `Tenant notice: ${c.facts.habitability.tenant_notice_required_rule}`,
        `Repair-and-deduct: ${
          c.facts.habitability.repair_and_deduct_allowed === true
            ? "may be allowed under conditions"
            : c.facts.habitability.repair_and_deduct_allowed === false
              ? "not allowed / very limited"
              : "varies"
        }`,
        `Rent withholding: ${
          c.facts.habitability.rent_withholding_allowed === true
            ? "may be allowed under conditions"
            : c.facts.habitability.rent_withholding_allowed === false
              ? "not allowed / very limited"
              : "varies"
        }`,
        `Termination: ${c.facts.habitability.tenant_termination_for_unrepaired_conditions_rule}`,
        `Retaliation: ${
          c.facts.habitability.retaliation_prohibited === true
            ? "retaliation is prohibited"
            : c.facts.habitability.retaliation_prohibited === false
              ? "confirm retaliation protections"
              : "varies"
        }`,
        `Code enforcement: ${c.facts.habitability.code_enforcement_contact_rule}`,
      ]
      return { ...s, bullets }
    }

    return s
  })

  return {
    ...page,
    stateSlug: c.state_slug,
    stateName: c.state_name,
    titleTag: `${c.state_name} Landlord Tenant Law 2026 | Rights, Deposits & Eviction`,
    metaDescription: `${c.state_name} landlord tenant law 2026: security deposit limits, eviction notice requirements, tenant rights & more. Plain-language guide for new landlords.`,
    h1: `${c.state_name} Landlord Tenant Law 2026`,
    sections,
  }
}

function updateSeedJurisdictionFromCanonical(j: Record<string, unknown>, c: CanonicalStateLaws): Record<string, unknown> {
  const out: Record<string, unknown> = { ...j }

  // Update the lightweight structured objects used in older generator + import payload content.
  out.security_deposit = {
    ...(typeof j.security_deposit === "object" && j.security_deposit ? (j.security_deposit as object) : {}),
    max_amount: c.facts.security_deposit.cap_rule,
    return_deadline_days: c.facts.security_deposit.return_deadline_days ?? undefined,
    itemized_statement_required: true,
    interest_on_deposit: c.facts.security_deposit.interest_rule,
  }

  out.eviction = {
    ...(typeof j.eviction === "object" && j.eviction ? (j.eviction as object) : {}),
    notice_period_nonpayment_days:
      c.facts.eviction.nonpayment_notice_days === "varies" ? "varies" : c.facts.eviction.nonpayment_notice_days ?? undefined,
    notice_period_lease_violation_days:
      c.facts.eviction.lease_violation_notice_days === "varies" ? "varies" : c.facts.eviction.lease_violation_notice_days ?? undefined,
    notice_period_month_to_month_days:
      c.facts.eviction.month_to_month_notice_days === "varies" ? "varies" : c.facts.eviction.month_to_month_notice_days ?? undefined,
  }

  out.landlord_entry = {
    ...(typeof j.landlord_entry === "object" && j.landlord_entry ? (j.landlord_entry as object) : {}),
    notice_hours: c.facts.landlord_entry.typical_notice_hours ?? undefined,
  }

  out.rent_control = {
    ...(typeof j.rent_control === "object" && j.rent_control ? (j.rent_control as object) : {}),
    rent_increase_notice_days:
      typeof c.facts.rent_increase.notice_days === "number" ? c.facts.rent_increase.notice_days : c.facts.rent_increase.notice_days ?? undefined,
    statewide_rent_control:
      typeof c.facts.rent_increase.statewide_rent_control === "boolean"
        ? c.facts.rent_increase.statewide_rent_control
        : undefined,
    local_rent_control_allowed:
      typeof c.facts.rent_increase.local_rent_control_allowed === "boolean"
        ? c.facts.rent_increase.local_rent_control_allowed
        : undefined,
  }

  out.habitability = {
    ...(typeof (j as any).habitability === "object" && (j as any).habitability ? ((j as any).habitability as object) : {}),
    implied_warranty_of_habitability:
      typeof c.facts.habitability.implied_warranty_of_habitability === "boolean"
        ? c.facts.habitability.implied_warranty_of_habitability
        : undefined,
    repair_and_deduct_allowed:
      typeof c.facts.habitability.repair_and_deduct_allowed === "boolean"
        ? c.facts.habitability.repair_and_deduct_allowed
        : c.facts.habitability.repair_and_deduct_allowed === "varies"
          ? "varies"
          : undefined,
    retaliation_prohibited:
      typeof c.facts.habitability.retaliation_prohibited === "boolean"
        ? c.facts.habitability.retaliation_prohibited
        : c.facts.habitability.retaliation_prohibited === "varies"
          ? "varies"
          : undefined,
  }

  // Optional: attempt to keep embedded string sections aligned with the cap rule where obvious.
  if (typeof out.security_deposit_section === "string") {
    // No-op; we preserve long statutory excerpts to avoid unintended corruption.
  }

  return out
}

function main(): void {
  const root = process.cwd()
  const canonicalDir = path.join(root, "app/data/state_laws_canonical")
  const seedPath = path.join(root, "app/data/state_laws.json")
  const statesDir = path.join(root, "app/data/states")

  bootstrapCanonicalIfMissing({ canonicalDir, seedPath })

  const canon = loadCanonicalAll(canonicalDir)
  const canonByCode = new Map(canon.map((c) => [c.state_code, c] as const))

  // Update app/data/states/*.json in place to preserve any manually expanded copy.
  const stateFiles = fs
    .readdirSync(statesDir)
    .filter((f) => f.toLowerCase().endsWith(".json") && f !== "index.json")

  for (const f of stateFiles) {
    const p = path.join(statesDir, f)
    const page = readJson<StateLawPage>(p)
    const slug = page.stateSlug
    const match = canon.find((c) => c.state_slug === slug)
    if (!match) continue
    const updated = updateStatePageFromCanonical(page, match)
    writeJson(p, updated)
  }

  // Refresh index.json ordering to match canonical list.
  const index = canon.map((c) => ({ stateSlug: c.state_slug, stateName: c.state_name }))
  writeJson(path.join(statesDir, "index.json"), index)

  // Update seed jurisdictions in place (preserve rich statute text, but fix structured fields).
  const seed = readJson<ExistingSeed>(seedPath)
  const jurisdictions = Array.isArray(seed.jurisdictions) ? seed.jurisdictions : []
  const updatedJurisdictions = jurisdictions.map((j) => {
    const code = String(j.state_code ?? "").trim().toUpperCase()
    const c = canonByCode.get(code)
    if (!c) return j
    return updateSeedJurisdictionFromCanonical(j, c)
  })
  const nextSeed: ExistingSeed = {
    ...seed,
    metadata: {
      ...(seed.metadata ?? {}),
      schema_version: "canonical_1.0",
      last_generated: new Date().toISOString(),
      canonical_source: "app/data/state_laws_canonical/*.json",
    },
    jurisdictions: updatedJurisdictions,
  }
  writeJson(seedPath, nextSeed)

  console.log(
    `[laws:generate] Updated states pages (${stateFiles.length}) and state_laws.json (${updatedJurisdictions.length}).`
  )
}

main()

