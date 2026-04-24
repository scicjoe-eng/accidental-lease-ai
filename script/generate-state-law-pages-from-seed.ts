/**
 * Generate per-state SEO pages from the existing structured seed.
 *
 * This is a starting point that we will web-verify and refine (especially top-20 states).
 * We intentionally do NOT output citations/sources into page JSON, per product requirements.
 */

import fs from "node:fs"
import path from "node:path"

type Seed = {
  jurisdictions: Array<{
    state: string
    state_code: string
    security_deposit?: {
      max_amount?: string
      return_deadline_days?: number
      itemized_statement_required?: boolean
      interest_on_deposit?: string
    }
    eviction?: {
      notice_period_nonpayment_days?: number | string
      notice_period_lease_violation_days?: number | string
      notice_period_month_to_month_days?: number | string
      estimated_timeline?: string
    }
    landlord_entry?: {
      notice_required?: boolean
      notice_hours?: number | string
      statutory_citation?: string
    }
    rent_control?: {
      statewide_rent_control?: boolean
      local_rent_control_allowed?: boolean
      rent_increase_notice_days?: number | string
    }
    habitability?: {
      repair_and_deduct_allowed?: boolean | string
      retaliation_prohibited?: boolean | string
    }
  }>
}

function slugifyStateName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function titleTag(stateName: string): string {
  return `${stateName} Landlord Tenant Law 2026 | Rights, Deposits & Eviction`
}

function metaDescription(stateName: string): string {
  return `${stateName} landlord tenant law 2026: security deposit limits, eviction notice requirements, tenant rights & more. Plain-language guide for new landlords.`
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true })
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8")
}

function main() {
  const workspaceRoot = process.cwd()
  const seedPath = path.join(workspaceRoot, "app/data/state_laws.json")
  const outDir = path.join(workspaceRoot, "app/data/states")
  ensureDir(outDir)

  const seedRaw = fs.readFileSync(seedPath, "utf8")
  const seed = JSON.parse(seedRaw) as Seed

  const index: Array<{ stateSlug: string; stateName: string }> = []

  for (const j of seed.jurisdictions) {
    const stateName = j.state
    const stateSlug = stateName === "District of Columbia" ? "district-of-columbia" : slugifyStateName(stateName)

    const sections = [
      {
        level: "h2",
        heading: "Security deposit rules",
        body: [
          `If you're looking for ${stateName} security deposit rules, focus on (1) whether there is a cap, (2) when the deposit must be returned, and (3) whether an itemized statement is required.`,
        ],
        bullets: [
          j.security_deposit?.max_amount
            ? `Deposit cap: ${j.security_deposit.max_amount}`
            : "Deposit cap: varies — confirm for your unit type and local rules.",
          typeof j.security_deposit?.return_deadline_days === "number"
            ? `Return deadline: typically ${j.security_deposit.return_deadline_days} days after move-out (may depend on deductions and delivery method).`
            : "Return deadline: varies by state/local rules and lease facts — confirm current law.",
          j.security_deposit?.itemized_statement_required === true
            ? "Itemized statement: generally required if deductions are taken."
            : "Itemized statement: may be required depending on deductions and local rules.",
          j.security_deposit?.interest_on_deposit
            ? `Interest: ${j.security_deposit.interest_on_deposit}`
            : "Interest: may apply in some jurisdictions (often locally).",
        ],
      },
      {
        level: "h2",
        heading: "Eviction notice requirements",
        body: [
          `For ${stateName} eviction notice requirements, the notice period often depends on why the eviction is being pursued (nonpayment vs lease violation vs holdover). Always use the correct notice form and follow the court process.`,
        ],
        bullets: [
          j.eviction?.notice_period_nonpayment_days != null
            ? `Nonpayment notice: commonly around ${j.eviction.notice_period_nonpayment_days} days (may be “pay or quit”).`
            : "Nonpayment notice: varies — confirm current statute and local rules.",
          j.eviction?.notice_period_lease_violation_days != null
            ? `Lease violation notice: commonly around ${j.eviction.notice_period_lease_violation_days} days (may allow cure).`
            : "Lease violation notice: varies — confirm cure rights and timelines.",
          j.eviction?.notice_period_month_to_month_days != null
            ? `Month-to-month termination: often ${j.eviction.notice_period_month_to_month_days} days (can vary with length of tenancy).`
            : "Month-to-month termination: varies with tenancy length and local protections.",
          j.eviction?.estimated_timeline
            ? `Typical timeline (uncontested): ${j.eviction.estimated_timeline}`
            : "Timeline: depends on court calendars and defenses; expect variability.",
        ],
      },
      {
        level: "h2",
        heading: "Landlord entry notice",
        body: [
          `If you're searching for ${stateName} landlord entry notice rules, look for (1) required notice time, (2) allowed entry reasons, and (3) emergency exceptions.`,
        ],
        bullets: [
          j.landlord_entry?.notice_required === false
            ? "Notice: no specific statewide statute in some states; leases and reasonableness standards often apply."
            : "Notice: usually required for non-emergency entry (check the statute and your lease).",
          j.landlord_entry?.notice_hours != null
            ? `Typical notice time: about ${j.landlord_entry.notice_hours} hours (common baseline; may vary).`
            : "Typical notice time: often 24 hours, but can vary by state/local law and lease terms.",
          "Emergencies: generally allow entry without advance notice.",
        ],
      },
      {
        level: "h2",
        heading: "Rent increase rules",
        body: [
          `For ${stateName} rent increase rules, most states focus on notice requirements, while rent caps are usually local (or limited to specific covered housing).`,
        ],
        bullets: [
          j.rent_control?.statewide_rent_control === true
            ? "Statewide rent control: exists (coverage and cap formulas vary)."
            : "Statewide rent control: typically none, but local/covered-housing rules may apply.",
          j.rent_control?.local_rent_control_allowed === false
            ? "Local rent control: restricted/preempted in some states."
            : "Local rent control: may exist in certain cities/counties (check if your property is covered).",
          j.rent_control?.rent_increase_notice_days != null
            ? `Notice of rent increase: commonly around ${j.rent_control.rent_increase_notice_days} days (varies by tenancy and local rules).`
            : "Notice of rent increase: varies — confirm current statute and any local ordinances.",
        ],
      },
      {
        level: "h2",
        heading: "Tenant rights & habitability basics",
        body: [
          `Most ${stateName} landlord tenant law disputes involve habitability, repairs, and retaliation protections. Keep repair requests documented and respond promptly.`,
        ],
        bullets: [
          j.habitability?.retaliation_prohibited != null
            ? "Retaliation: generally prohibited when tenants exercise protected rights."
            : "Retaliation: usually prohibited; confirm details in state statute.",
          j.habitability?.repair_and_deduct_allowed != null
            ? "Repairs: some states allow limited repair-and-deduct under conditions."
            : "Repairs: remedies vary; confirm notice requirements and limits.",
          "Local ordinances can add stricter standards (especially large metros).",
        ],
      },
    ] as const

    const page = {
      stateSlug,
      stateName,
      year: 2026,
      titleTag: titleTag(stateName),
      metaDescription: metaDescription(stateName),
      h1: `${stateName} Landlord Tenant Law 2026`,
      sections,
      jurisdictionNotes: [
        "Local ordinances (city/county) can be stricter than state law.",
        "Rules can change; verify before acting on any single requirement.",
      ],
      confidenceNotes: [
        "This page is being refreshed for accuracy; key limits and notice periods are verified state-by-state during the rollout.",
      ],
    }

    writeJson(path.join(outDir, `${stateSlug}.json`), page)
    index.push({ stateSlug, stateName })
  }

  index.sort((a, b) => a.stateName.localeCompare(b.stateName))
  writeJson(path.join(outDir, "index.json"), index)
}

main()

