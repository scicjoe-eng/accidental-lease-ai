export type CanonicalSource = {
  type: "statute" | "court" | "agency" | "other"
  title: string
  url: string
  extractedQuotes?: string[]
  /**
   * Optional: declare which canonical fields this source supports.
   * Example: ["facts.security_deposit.cap_rule", "facts.security_deposit.return_deadline_days"]
   */
  appliesToFacts?: string[]
}

export type CanonicalFactValue = string | number | boolean | null

export type CanonicalRuleNotes = {
  /**
   * Free-form clarifications for "varies" and edge cases.
   * These are internal-only (not necessarily shown on pages).
   */
  notes?: string[]
}

export type CanonicalStateLaws = {
  state_code: string
  state_name: string
  state_slug: string
  last_verified_at: string
  verified_by: string

  facts: {
    security_deposit: {
      cap_rule: string
      return_deadline_days: number | null
      interest_rule: string

      itemized_statement_required: boolean | "varies" | null
      itemized_statement_deadline_days: number | "varies" | null
      allowed_deductions_rule: string
      deposit_receipt_required: boolean | "varies" | null
      move_in_checklist_required: boolean | "varies" | null
      penalty_for_bad_faith_rule: string
      prepaid_rent_treatment_rule: string
      nonrefundable_fee_rule: string
      holding_deposit_rule: string
      deposit_storage_segregation_rule: string
      deposit_transfer_on_sale_rule: string
      special_rules_local_overrides_note: string
    } & CanonicalRuleNotes
    eviction: ({
      nonpayment_notice_days: number | "varies" | null
      lease_violation_notice_days: number | "varies" | null
      month_to_month_notice_days: number | "varies" | null

      judicial_process_required: boolean | "varies" | null
      self_help_eviction_prohibited: boolean | "varies" | null
      nonpayment_notice_type: string
      lease_violation_notice_type: string
      lease_violation_cure_allowed: boolean | "varies" | null
      holdover_notice_type: string
      timeline_estimate_rule: string
      court_process_summary_rule: string
      filing_court_rule: string
      service_of_process_rule: string
    } & CanonicalRuleNotes)
    landlord_entry: ({
      notice_rule: "statute" | "reasonable" | "lease" | "varies"
      typical_notice_hours: number | null
      advance_notice_required: boolean | "varies" | null
      emergency_entry_allowed: boolean | "varies" | null
      allowed_entry_reasons_rule: string
      entry_time_window_rule: string
      tenant_can_refuse_unreasonable_entry: boolean | "varies" | null
      penalty_for_illegal_entry_rule: string
    } & CanonicalRuleNotes)
    rent_increase: ({
      notice_days: number | "varies" | null
      cap_rule: string
      statewide_rent_control: boolean | "varies" | null
      local_rent_control_allowed: boolean | "varies" | null
      fixed_term_increase_allowed_rule: string
      month_to_month_increase_allowed_rule: string
      just_cause_required_for_increase: boolean | "varies" | null
      delivery_method_rule: string
      retaliation_protection_note: string
    } & CanonicalRuleNotes)
    habitability: ({
      implied_warranty_of_habitability: boolean | "varies" | null
      landlord_repair_duty_rule: string
      tenant_notice_required_rule: string
      repair_and_deduct_allowed: boolean | "varies" | null
      rent_withholding_allowed: boolean | "varies" | null
      tenant_termination_for_unrepaired_conditions_rule: string
      retaliation_prohibited: boolean | "varies" | null
      code_enforcement_contact_rule: string
    } & CanonicalRuleNotes)
  }

  sources: CanonicalSource[]

  /**
   * Short, plain-language narrative summary for internal use (RAG prompt building).
   * Keep it consistent with facts; avoid over-precision.
   */
  narrative?: {
    summary: string
    bullets?: string[]
  }
}

