/**
 * OpenAI-compatible LLM: **DeepSeek** by default; **Alibaba DashScope (百炼)** via `AI_PROVIDER=dashscope`.
 * **Server-only** — never expose API keys to the client.
 */

import { createOpenAI } from "@ai-sdk/openai"
import {
  APICallError,
  generateText,
  Output,
  zodSchema,
} from "ai"
import OpenAI, { APIError } from "openai"
import { z } from "zod"

// ─── Provider & defaults ─────────────────────────────────────────────────────

export type LlmProviderId = "deepseek" | "dashscope"

/** Default host when no explicit AI base URL env is set (DeepSeek). `/v1` appended if missing. */
export const DEEPSEEK_DEFAULT_HOST = "https://api.deepseek.com"

export const DASHSCOPE_DEFAULT_BASE_URL =
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

export const DASHSCOPE_CN_COMPAT_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1"

export const QWEN_LEASE_MODEL = "qwen3.6-plus" as const

export const LEASE_GENERATION_FRIENDLY_ERROR =
  "We could not generate a lease draft right now. Please try again later, use a local template, and consult a licensed attorney in your state before signing anything."

/**
 * Prepended to lease and audit system prompts so model output stays English for US/EU-facing UX.
 */
export const LLM_ENGLISH_ONLY_SYSTEM_PREAMBLE =
  "You are a professional US real estate attorney and AI lease assistant. You MUST respond in clear, professional English only. Never output any Chinese characters. Always reply in English.\n\n"

/**
 * Appended to user prompts for lease generation and PDF audit.
 */
export const LLM_USER_PROMPT_ENGLISH_ONLY_SUFFIX =
  "Output everything in English only. Do not include any Chinese text. Respond with valid JSON if required."

/** Sampling temperature for lease draft streaming and PDF audit (structured JSON paths). */
export const LLM_LEASE_AUDIT_TEMPERATURE = 0.7

/**
 * `deepseek` (default) or `dashscope` / `alibaba` / `qwen` / `tongyi` for 百炼.
 */
export function getLlmProviderId(): LlmProviderId {
  const raw = (
    process.env.AI_PROVIDER ??
    process.env.LLM_PROVIDER ??
    ""
  )
    .trim()
    .toLowerCase()
  if (
    raw === "dashscope" ||
    raw === "alibaba" ||
    raw === "qwen" ||
    raw === "tongyi"
  ) {
    return "dashscope"
  }
  return "deepseek"
}

/**
 * Normalize base URL for OpenAI-compatible clients (`.../v1` or DashScope `.../compatible-mode/v1`).
 */
export function normalizeOpenAiCompatibleBaseUrl(url: string): string {
  const t = url.trim().replace(/\/$/, "")
  if (t.includes("/compatible-mode") || /\/v\d+$/i.test(t)) return t
  return `${t}/v1`
}

/**
 * Prefer server-only `AI_BASE_URL`; else `NEXT_PUBLIC_AI_BASE_URL` (legacy); else provider defaults.
 */
export function getOpenAiCompatibleBaseUrl(): string {
  const explicit =
    process.env.AI_BASE_URL?.trim() ??
    process.env.NEXT_PUBLIC_AI_BASE_URL?.trim()
  if (explicit) return normalizeOpenAiCompatibleBaseUrl(explicit)
  const fallback =
    getLlmProviderId() === "dashscope"
      ? DASHSCOPE_DEFAULT_BASE_URL
      : DEEPSEEK_DEFAULT_HOST
  return normalizeOpenAiCompatibleBaseUrl(fallback)
}

/** @deprecated Use {@link getOpenAiCompatibleBaseUrl}. */
export function getDashScopeBaseUrl(): string {
  return getOpenAiCompatibleBaseUrl()
}

/** `process.env.AI_MODEL` or provider default (`deepseek-chat` / `qwen3.6-plus`). */
export function getAiModelId(): string {
  const custom = process.env.AI_MODEL?.trim()
  if (custom) return custom
  return getLlmProviderId() === "dashscope"
    ? QWEN_LEASE_MODEL
    : "deepseek-chat"
}

export function getLlmApiKey(): string | undefined {
  if (getLlmProviderId() === "dashscope") {
    return process.env.DASHSCOPE_API_KEY?.trim()
  }
  return process.env.DEEPSEEK_API_KEY?.trim()
}

function requireLlmApiKey(): string {
  const key = getLlmApiKey()
  if (key) return key
  if (getLlmProviderId() === "dashscope") {
    throw new Error(
      "Missing DASHSCOPE_API_KEY when AI_PROVIDER is dashscope / alibaba."
    )
  }
  throw new Error("Missing DEEPSEEK_API_KEY for default DeepSeek provider.")
}

function sdkProviderName(): string {
  return getLlmProviderId() === "dashscope"
    ? "alibaba-dashscope-compatible"
    : "deepseek-openai-compatible"
}

// ─── Logging (required shapes) ───────────────────────────────────────────────

/** Human-readable provider label for logs. */
export function getLlmProviderLogLabel(): "DeepSeek" | "DashScope" {
  return getLlmProviderId() === "deepseek" ? "DeepSeek" : "DashScope"
}

/**
 * Before each LLM usage path. Uses `DEEPSEEK_API_KEY` length when provider is DeepSeek (as requested).
 */
export function logLlmCallStartCanonical(extra?: {
  callerContext?: string
}): void {
  const provider = getLlmProviderLogLabel()
  const model = getAiModelId()
  const baseURL = getOpenAiCompatibleBaseUrl()
  const apiKeyLength =
    provider === "DeepSeek"
      ? process.env.DEEPSEEK_API_KEY?.length || 0
      : process.env.DASHSCOPE_API_KEY?.length || 0

  console.log("=== LLM Call Start ===", {
    provider,
    model,
    baseURL,
    apiKeyLength,
    ...extra,
  })
}

export function logLlmCallSuccess(
  context: string,
  responseLength: number,
  extra?: Record<string, unknown>
): void {
  console.log("=== LLM Call Success ===", {
    context,
    responseLength,
    ...extra,
  })
}

export function logLlmCallFailure(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  let status: number | undefined
  if (APICallError.isInstance(error)) status = error.statusCode
  else if (error instanceof APIError && error.status != null)
    status = error.status
  console.error("=== LLM Call Failed ===", {
    context,
    message,
    status,
    error,
  })
}

// ─── OpenAI SDK client (connectivity ping) ───────────────────────────────────

export function createLlmOpenAIClient(): OpenAI {
  const baseURL = getOpenAiCompatibleBaseUrl()
  const apiKey = requireLlmApiKey()
  return new OpenAI({ baseURL, apiKey })
}

/** @deprecated Use {@link createLlmOpenAIClient}. */
export function createDashScopeOpenAIClient(): OpenAI {
  return createLlmOpenAIClient()
}

function appendDashScopeApiKeyHint(message: string): string {
  if (getLlmProviderId() !== "dashscope") return message
  const m = message.toLowerCase()
  if (
    !m.includes("incorrect api key") &&
    !m.includes("invalid_api_key") &&
    !m.includes("invalid api key")
  ) {
    return message
  }
  return `${message} — Region hint: set AI_BASE_URL=${DASHSCOPE_CN_COMPAT_BASE_URL} (mainland) or ${DASHSCOPE_DEFAULT_BASE_URL} (intl). Restart dev after .env changes.`
}

export function formatLlmErrorForUser(error: unknown): string {
  if (APICallError.isInstance(error)) {
    const bits = [error.message]
    if (error.statusCode != null) bits.push(`HTTP ${error.statusCode}`)
    let base = bits.join(" · ")
    if (
      error.message.includes("response_format type is unavailable") &&
      getLlmProviderId() === "deepseek"
    ) {
      base +=
        " — DeepSeek’s API rejects JSON-schema response mode; retry or set AI_PROVIDER=dashscope for structured streaming."
    }
    return appendDashScopeApiKeyHint(base) || LEASE_GENERATION_FRIENDLY_ERROR
  }
  if (error instanceof APIError) {
    const bits = [error.message]
    if (error.status) bits.push(`HTTP ${error.status}`)
    if (error.code) bits.push(`code: ${String(error.code)}`)
    if (error.type) bits.push(`type: ${error.type}`)
    return appendDashScopeApiKeyHint(`LLM request failed: ${bits.join(" · ")}`)
  }
  if (error instanceof Error) {
    const msg = error.message.trim()
    return appendDashScopeApiKeyHint(msg) || LEASE_GENERATION_FRIENDLY_ERROR
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim()
  }
  try {
    return `LLM error: ${JSON.stringify(error)}`
  } catch {
    return LEASE_GENERATION_FRIENDLY_ERROR
  }
}

export async function runLlmConnectivityPing(): Promise<
  { ok: true; content: string } | { ok: false; message: string }
> {
  logLlmCallStartCanonical({ callerContext: "runLlmConnectivityPing" })

  const apiKey = getLlmApiKey()
  if (!apiKey) {
    const msg =
      getLlmProviderId() === "dashscope"
        ? "Missing DASHSCOPE_API_KEY (AI_PROVIDER=dashscope)."
        : "Missing DEEPSEEK_API_KEY (default DeepSeek)."
    logLlmCallFailure("runLlmConnectivityPing", new Error(msg))
    return { ok: false, message: msg }
  }

  const model = getAiModelId()

  try {
    const openai = createLlmOpenAIClient()
    const res = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a connectivity probe. Reply with exactly: Test successful (two words, no punctuation, no other text).",
        },
        {
          role: "user",
          content: "Connectivity check. Respond with exactly: Test successful",
        },
      ],
      max_tokens: 32,
      temperature: 0,
    })

    const content = res.choices[0]?.message?.content?.trim() ?? ""

    if (!content) {
      const err = new Error("Empty completion from connectivity ping")
      logLlmCallFailure("runLlmConnectivityPing", err)
      return {
        ok: false,
        message:
          "LLM returned an empty completion. Check AI_MODEL and account quotas.",
      }
    }

    logLlmCallSuccess("runLlmConnectivityPing", content.length, { model })
    return { ok: true, content }
  } catch (error) {
    logLlmCallFailure("runLlmConnectivityPing", error)
    return { ok: false, message: formatLlmErrorForUser(error) }
  }
}

// ─── Form input ─────────────────────────────────────────────────────────────

export type LeaseFormInput = {
  jurisdiction_state: string
  premises_address: string
  property_type?: string
  landlord_name: string
  landlord_contact?: string
  tenant_names: string
  tenant_contact?: string
  lease_start_date: string
  lease_end_date?: string
  term_type?: "Fixed-term" | "Month-to-month"
  monthly_rent: string
  rent_due_day?: string
  security_deposit?: string
  deposit_mode?: "No deposit" | "Deposit"
  deposit_amount?: string
  payment_method?: string
  payment_notes?: string
  utilities_multi?: string[]
  utilities_included?: string
  pets_policy?: string
  parking_storage?: string
  maintenance_resp?: string
  special_terms?: string
}

export const leaseFormInputSchema = z.object({
  jurisdiction_state: z.string().min(1).max(120),
  /** Optional on intake UI; normalized to a placeholder before LLM if empty. */
  premises_address: z.string().max(4000).optional().default(""),
  property_type: z.string().max(500).optional(),
  landlord_name: z.string().min(1).max(500),
  landlord_contact: z.string().max(500).optional(),
  tenant_names: z.string().min(1).max(1000),
  tenant_contact: z.string().max(500).optional(),
  lease_start_date: z.string().min(1).max(120),
  lease_end_date: z.string().max(120).optional(),
  term_type: z.enum(["Fixed-term", "Month-to-month"]).optional(),
  monthly_rent: z.string().min(1).max(120),
  rent_due_day: z.string().max(120).optional(),
  security_deposit: z.string().max(120).optional(),
  deposit_mode: z.enum(["No deposit", "Deposit"]).optional(),
  deposit_amount: z.string().max(120).optional(),
  payment_method: z.string().max(200).optional(),
  payment_notes: z.string().max(500).optional(),
  utilities_multi: z.array(z.string().max(100)).max(50).optional(),
  utilities_included: z.string().max(2000).optional(),
  pets_policy: z.string().max(2000).optional(),
  parking_storage: z.string().max(2000).optional(),
  maintenance_resp: z.string().max(2000).optional(),
  special_terms: z.string().max(8000).optional(),
})

export function getSignReadyMissingFields(form: LeaseFormInput): string[] {
  const missing: string[] = []
  if (!form.premises_address?.trim() || form.premises_address.includes("Not provided"))
    missing.push("premises_address")
  if (!form.rent_due_day?.trim()) missing.push("rent_due_day")
  if (!form.landlord_contact?.trim()) missing.push("landlord_contact")
  if (form.deposit_mode === "Deposit") {
    const amt = (form.deposit_amount ?? form.security_deposit ?? "").trim()
    if (!amt || amt.toLowerCase() === "none") missing.push("security_deposit")
  }
  return missing
}

export function normalizeLeaseFormInput(
  raw: z.infer<typeof leaseFormInputSchema>
): LeaseFormInput {
  const t = (s: string | undefined) => {
    const v = s?.trim()
    return v === "" || v === undefined ? undefined : v
  }
  const premises = raw.premises_address?.trim() ?? ""
  const deposit_mode = raw.deposit_mode?.trim() as
    | "No deposit"
    | "Deposit"
    | undefined
  const deposit_amount = t(raw.deposit_amount)
  const security_deposit = t(raw.security_deposit)
  const securityDepositNormalized =
    deposit_mode === "No deposit"
      ? "None"
      : deposit_amount ?? security_deposit

  const term_type = raw.term_type as "Fixed-term" | "Month-to-month" | undefined
  const lease_end_date =
    term_type === "Month-to-month" ? undefined : t(raw.lease_end_date)

  const utilitiesMulti =
    Array.isArray(raw.utilities_multi) && raw.utilities_multi.length > 0
      ? raw.utilities_multi.map((x) => String(x).trim()).filter(Boolean)
      : undefined
  const utilitiesSumm =
    utilitiesMulti && utilitiesMulti.length
      ? `Utilities included: ${utilitiesMulti.join(", ")}.`
      : undefined
  const utilities_included = t(raw.utilities_included) ?? utilitiesSumm

  return {
    jurisdiction_state: raw.jurisdiction_state.trim(),
    premises_address:
      premises ||
      "Not provided — add full street address before signing.",
    property_type: t(raw.property_type),
    landlord_name: raw.landlord_name.trim(),
    landlord_contact: t(raw.landlord_contact),
    tenant_names: raw.tenant_names.trim(),
    tenant_contact: t(raw.tenant_contact),
    lease_start_date: raw.lease_start_date.trim(),
    lease_end_date,
    term_type,
    monthly_rent: raw.monthly_rent.trim(),
    rent_due_day: t(raw.rent_due_day),
    deposit_mode,
    deposit_amount,
    security_deposit: securityDepositNormalized,
    payment_method: t(raw.payment_method),
    payment_notes: t(raw.payment_notes),
    utilities_multi: utilitiesMulti,
    utilities_included,
    pets_policy: t(raw.pets_policy),
    parking_storage: t(raw.parking_storage),
    maintenance_resp: t(raw.maintenance_resp),
    special_terms: t(raw.special_terms),
  }
}

// ─── Structured lease output ─────────────────────────────────────────────────

export const leaseContractZodSchema = z.object({
  disclaimer_banner: z.string(),
  title: z.string(),
  parties: z.object({
    landlord: z.string(),
    tenant: z.string(),
    premises_address: z.string(),
  }),
  term: z.object({
    start_date: z.string(),
    end_date: z.string().optional(),
    is_month_to_month: z.boolean(),
    notes: z.string().optional(),
  }),
  rent: z.object({
    amount: z.string(),
    due: z.string().optional(),
    late_fees: z.string().optional(),
    payment: z.string().optional(),
  }),
  deposit: z.object({
    amount: z.string(),
    disposition: z.string().optional(),
  }),
  clauses: z.array(
    z.object({
      title: z.string(),
      text: z.string(),
    })
  ),
  governing_law: z.object({
    state: z.string(),
    choice_of_law_notes: z.string().optional(),
    state_highlights: z.array(z.string()),
  }),
})

export type LeaseContract = z.infer<typeof leaseContractZodSchema>

const leaseOutput = Output.object({
  name: "ResidentialLeaseDraft",
  description: "Structured residential lease draft for U.S. accidental landlords.",
  schema: zodSchema(leaseContractZodSchema),
})

const LEASE_SYSTEM_PROMPT = `${LLM_ENGLISH_ONLY_SYSTEM_PREAMBLE}You are AcciLease AI, drafting a U.S. residential lease contract **draft** for accidental landlords in the United States (all 50 states + District of Columbia).

## Jurisdiction & state law (high level)
- Landlord–tenant law is **state-specific** and sometimes city/county-specific (e.g., rent control, just-cause, registration, eviction procedure, notice periods, fee caps, security-deposit caps and timelines, habitability, disclosures).
- Mention **only generally known** categories of variation in \`governing_law.state_highlights\` for the user’s state—do not cite statutes by number unless you are certain; prefer “verify with local counsel.”
- **Federal overlays**: e.g., lead-paint disclosure for pre-1978 housing, fair housing, ADA/FHA themes where relevant—stay high-level.
- **DC** is treated as its own jurisdiction (not a state).

## Accidental-landlord–friendly themes (when appropriate)
- Clear **rent, due date, grace period**, and **late fee** language that encourages compliance with typical state reasonableness concepts (avoid punitive-sounding terms).
- **Access & notice**: reasonable notice for entry; emergency exceptions.
- **Maintenance**: split of responsibilities; how to report issues; habitability acknowledgment in plain English.
- **Property protection**: smoke/CO detectors, no alterations without consent, keys/locks, property condition baseline.
- **Flexibility**: optional clauses for **early move-out negotiation**, **month-to-month conversion**, or **subletting/assignment** only as placeholders—flag that enforceability depends on state and local law.
- **Security deposit**: tie return timeline language to “per applicable state/local law” if unsure of exact days.

## Output rules
- Follow the structured JSON schema exactly. Populate every required field meaningfully from the user form.
- \`disclaimer_banner\` must be an empty string ("").
- \`clauses\` should include numbered-style titles and plain-English body text suitable for an attorney to revise.
- Keep tone professional, neutral, and suitable for U.S. residential landlords new to leasing.
- Every string in the JSON (titles, clause text, notes, highlights) must be **English only** — no Chinese or other non-Latin scripts.`

const LEASE_JSON_OBJECT_SUFFIX = `

## JSON encoding (required)
Return **one JSON object only** (no markdown code fences, no commentary before or after).
Use exactly these top-level keys: \`disclaimer_banner\`, \`title\`, \`parties\`, \`term\`, \`rent\`, \`deposit\`, \`clauses\`, \`governing_law\`.
- \`parties\`: \`landlord\`, \`tenant\`, \`premises_address\` (strings).
- \`term\`: \`start_date\`, optional \`end_date\`, \`is_month_to_month\` (boolean), optional \`notes\`.
- \`rent\`: \`amount\`, optional \`due\`, \`late_fees\`, \`payment\`.
- \`deposit\`: \`amount\`, optional \`disposition\`.
- \`clauses\`: array of objects with \`title\` and \`text\` (strings).
- \`governing_law\`: \`state\`, optional \`choice_of_law_notes\`, \`state_highlights\` (array of strings).
\`disclaimer_banner\` must be an empty string ("").`

const LEASE_RAG_SECTION_HEADER = `

## AcciLease state law reference (retrieved)
The following is verified jurisdictional summary data from AcciLease. Align **security deposits, eviction notices, habitability, late fees, rent increases / rent control, lease termination notices, and landlord entry** with this material when drafting clauses. Cite statute identifiers **only** when they appear in the reference. If the intake form conflicts with this reference, note that the parties should verify with local counsel. Local city or county ordinances may add stricter rules — flag when relevant.
`

function buildLeaseSystemPromptWithRag(ragAppendix?: string): string {
  const t = ragAppendix?.trim()
  if (!t) return LEASE_SYSTEM_PROMPT
  return `${LEASE_SYSTEM_PROMPT}${LEASE_RAG_SECTION_HEADER}
---
${t}
---
`
}

function buildLeaseJsonObjectSystemPromptWithRag(ragAppendix?: string): string {
  return buildLeaseSystemPromptWithRag(ragAppendix) + LEASE_JSON_OBJECT_SUFFIX
}

function stripLeaseResponseJsonFence(raw: string): string {
  let s = raw.trim()
  const m = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(s)
  if (m) s = m[1].trim()
  return s
}

/**
 * LLMs often emit JSON \`null\` for omitted optional fields. Zod \`.optional()\`
 * accepts undefined / missing keys, not \`null\`.
 */
function stripJsonNullsDeep(value: unknown): unknown {
  if (value === null) return undefined
  if (Array.isArray(value)) {
    return value
      .map(stripJsonNullsDeep)
      .filter((v) => v !== undefined)
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(o)) {
      const cleaned = stripJsonNullsDeep(v)
      if (cleaned !== undefined) out[k] = cleaned
    }
    return out
  }
  return value
}

/**
 * Validate lease contract content quality
 */
function validateLeaseContractQuality(contract: LeaseContract): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 100
  
  // Check for required clauses
  const requiredClauses = [
    "Parties",
    "Premises",
    "Term",
    "Rent",
    "Security Deposit",
    "Maintenance",
    "Repairs",
    "Habitability",
    "Landlord Entry",
    "Eviction",
    "Rent Increase",
    "Termination",
    "Governing Law"
  ]
  
  const clauseTitles = contract.clauses.map(c => c.title)
  for (const requiredClause of requiredClauses) {
    if (!clauseTitles.some(title => title.toLowerCase().includes(requiredClause.toLowerCase()))) {
      issues.push(`Missing required clause: ${requiredClause}`)
      score -= 10
    }
  }
  
  // Check for state-specific highlights
  if (contract.governing_law.state_highlights.length < 3) {
    issues.push("Too few state-specific legal highlights (target >= 3)")
    score -= 15
  }
  
  // Check for reasonable clause length
  for (const clause of contract.clauses) {
    if (clause.text.length < 50) {
      issues.push(`Clause "${clause.title}" is too short`)
      score -= 5
    }
  }
  
  // Check for complete parties information
  if (!contract.parties.landlord || !contract.parties.tenant) {
    issues.push("Incomplete parties information")
    score -= 15
  }
  
  return { score: Math.max(0, score), issues }
}

const LEASE_QUALITY_AUTO_REVISE_THRESHOLD = 85

function buildLeaseRevisionPrompt(args: {
  form: LeaseFormInput
  current: LeaseContract
  issues: string[]
}): string {
  const issuesText = args.issues.map((s) => `- ${s}`).join("\n")
  return `# Lease Revision Request

You previously drafted a lease in structured JSON, but it has quality issues.

## Quality issues to fix
${issuesText || "- (none provided)"}

## Instructions
- Return a revised lease that fixes the issues above.
- Keep the same parties, premises, and jurisdiction from the form.
- Ensure clause text is practical and actionable (not just generic placeholders).
- Ensure clauses align with the provided AcciLease jurisdiction reference (if present).
- Output ONE valid JSON object that matches the required schema exactly.

## Form (source of truth)
- Jurisdiction: ${args.form.jurisdiction_state}
- Premises: ${args.form.premises_address}
- Landlord: ${args.form.landlord_name}
- Tenant(s): ${args.form.tenant_names}
- Lease start: ${args.form.lease_start_date}
- Lease end: ${args.form.lease_end_date || "Month-to-month"}
- Monthly rent: ${args.form.monthly_rent}
- Deposit: ${args.form.security_deposit || "Not specified"}

## Current draft JSON (revise this)
${JSON.stringify(args.current, null, 2)}
`
}

async function reviseLeaseContractIfLowQuality(args: {
  form: LeaseFormInput
  contract: LeaseContract
  options: Pick<
    GenerateLeaseContractOptions,
    "abortSignal" | "maxOutputTokens" | "stateLawRagAppendix"
  >
}): Promise<LeaseContract> {
  const quality = validateLeaseContractQuality(args.contract)
  if (quality.score >= LEASE_QUALITY_AUTO_REVISE_THRESHOLD || quality.issues.length === 0) {
    return args.contract
  }

  console.warn("[lease] auto-revising low-quality draft", {
    score: quality.score,
    issues: quality.issues,
  })

  // Use the same provider path as generation. Keep temperature low for revision.
  if (getLlmProviderId() === "deepseek") {
    const openai = createLlmOpenAIClient()
    const model = getAiModelId()
    const maxTokens = args.options.maxOutputTokens ?? 8192
    const systemPrompt = buildLeaseJsonObjectSystemPromptWithRag(args.options.stateLawRagAppendix)
    const res = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: buildLeaseRevisionPrompt({
            form: args.form,
            current: args.contract,
            issues: quality.issues,
          }),
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
      response_format: { type: "json_object" },
    })
    const raw = res.choices[0]?.message?.content?.trim() ?? ""
    if (!raw) throw new Error("Empty completion from lease revision (DeepSeek json_object).")
    return parseLeaseContractFromModelJson(raw)
  }

  const model = getLeaseLanguageModel("lease.revise.generateText")
  const systemPrompt = buildLeaseSystemPromptWithRag(args.options.stateLawRagAppendix)
  const { output } = await generateText({
    model,
    abortSignal: args.options.abortSignal,
    maxOutputTokens: args.options.maxOutputTokens ?? 8192,
    temperature: 0.3,
    system: systemPrompt,
    prompt: buildLeaseRevisionPrompt({
      form: args.form,
      current: args.contract,
      issues: quality.issues,
    }),
    output: leaseOutput,
  })

  return output
}

function parseLeaseContractFromModelJson(raw: string): LeaseContract {
  const s = stripLeaseResponseJsonFence(raw)
  const data = JSON.parse(s) as Record<string, unknown>
  data.disclaimer_banner = ""
  const cleaned = stripJsonNullsDeep(data)
  const contract = leaseContractZodSchema.parse(cleaned)
  
  // Validate contract quality
  const quality = validateLeaseContractQuality(contract)
  console.log("Lease contract quality score:", quality.score, "issues:", quality.issues)
  
  return contract
}

async function generateLeaseContractViaDeepSeekJsonObject(
  form: LeaseFormInput,
  options: Pick<
    GenerateLeaseContractOptions,
    "abortSignal" | "maxOutputTokens" | "stateLawRagAppendix"
  >
): Promise<LeaseContract> {
  logLlmCallStartCanonical({ callerContext: "generateLeaseContract.deepseek" })

  const openai = createLlmOpenAIClient()
  const model = getAiModelId()
  const maxTokens = options.maxOutputTokens ?? 8192
  const systemPrompt = buildLeaseJsonObjectSystemPromptWithRag(
    options.stateLawRagAppendix
  )

  const createOpts: Parameters<
    typeof openai.chat.completions.create
  >[1] = {}
  if (options.abortSignal) createOpts.signal = options.abortSignal

  const res = await openai.chat.completions.create(
    {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(form) },
      ],
      max_tokens: maxTokens,
      temperature: LLM_LEASE_AUDIT_TEMPERATURE,
      response_format: { type: "json_object" },
    },
    createOpts
  )

  const raw = res.choices[0]?.message?.content?.trim() ?? ""
  if (!raw) {
    throw new Error("Empty completion from lease draft (DeepSeek json_object).")
  }

  const contract = parseLeaseContractFromModelJson(raw)
  logLlmCallSuccess(
    "generateLeaseContract.deepseekJsonObject",
    JSON.stringify(contract).length,
    { clauseCount: contract.clauses.length }
  )
  return contract
}

// ─── AI SDK model factory (generateText) ───────────────────────────────────

export function getLeaseLanguageModel(callerContext = "lease.generateText") {
  const baseURL = getOpenAiCompatibleBaseUrl()
  const apiKey = requireLlmApiKey()
  const modelId = getAiModelId()

  logLlmCallStartCanonical({
    callerContext,
  })

  const openaiProvider = createOpenAI({
    baseURL,
    apiKey,
    name: sdkProviderName(),
  })

  return openaiProvider.chat(modelId)
}

export function getQwenChatModel(
  mode: "generateText" | "streamText" = "generateText"
) {
  return getLeaseLanguageModel(
    mode === "streamText" ? "audit.streamText" : "audit.generateText"
  )
}

function buildUserPrompt(form: LeaseFormInput): string {
  const termLine =
    form.term_type === "Month-to-month"
      ? "Month-to-month"
      : form.lease_end_date
        ? `Fixed-term until ${form.lease_end_date}`
        : "Fixed-term (end date not provided)"
  const depositLine =
    form.deposit_mode === "No deposit"
      ? "No deposit"
      : form.security_deposit
        ? `Deposit amount: ${form.security_deposit}`
        : "Deposit amount not provided"
  const paymentLine = form.payment_method
    ? `${form.payment_method}${form.payment_notes ? ` — ${form.payment_notes}` : ""}`
    : "Not specified"
  const utilitiesLine = form.utilities_included
    ? form.utilities_included
    : "Not specified"

  return `# Lease Generation Request

Please generate a comprehensive, legally compliant residential lease agreement based on the following information:

## Property Information
- **Jurisdiction State**: ${form.jurisdiction_state}
- **Premises Address**: ${form.premises_address}
- **Property Type**: ${form.property_type || "Residential"}

## Parties
- **Landlord**: ${form.landlord_name}
- **Landlord Contact**: ${form.landlord_contact || "Not provided"}
- **Tenant(s)**: ${form.tenant_names}
- **Tenant Contact**: ${form.tenant_contact || "Not provided"}

## Lease Terms
- **Lease Start Date**: ${form.lease_start_date}
- **Term Type**: ${termLine}
- **Monthly Rent**: ${form.monthly_rent}
- **Rent Due Day**: ${form.rent_due_day || "Not specified"}
- **Security Deposit**: ${depositLine}
- **Payment Method**: ${paymentLine}

## Additional Terms
- **Utilities Included**: ${utilitiesLine}
- **Pets Policy**: ${form.pets_policy || "Not specified"}
- **Parking/Storage**: ${form.parking_storage || "Not specified"}
- **Maintenance Responsibility**: ${form.maintenance_resp || "Not specified"}
- **Special Terms**: ${form.special_terms || "None"}

## Requirements
1. Generate a structured lease agreement that complies with the laws of ${form.jurisdiction_state}
2. Include all required sections and clauses
3. Use clear, professional language
4. Ensure all terms are balanced and reasonable
5. Include state-specific legal highlights

${LLM_USER_PROMPT_ENGLISH_ONLY_SUFFIX}`
}

export type LeaseGenerationSuccess = {
  ok: true
  contract: LeaseContract
}

export type LeaseGenerationFailure = {
  ok: false
  userMessage: string
  cause?: unknown
}

export type GenerateLeaseContractResult =
  | LeaseGenerationSuccess
  | LeaseGenerationFailure

export type GenerateLeaseContractOptions = {
  abortSignal?: AbortSignal
  maxOutputTokens?: number
  skipConnectivityPing?: boolean
  /** Plain-text state law summary from `app/lib/rag.ts` (retrieve + format). */
  stateLawRagAppendix?: string
}

// Maximum number of retry attempts for LLM calls
const MAX_RETRY_ATTEMPTS = 2

// Delay between retry attempts (milliseconds)
const RETRY_DELAY = 1000

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Check if this is a retryable error
      const isRetryable = (
        error instanceof APICallError && 
        error.statusCode !== undefined &&
        (error.statusCode >= 500 || error.statusCode === 429)
      ) || (
        error instanceof APIError && 
        error.status !== undefined &&
        (error.status >= 500 || error.status === 429)
      )
      
      if (!isRetryable || attempt === maxAttempts - 1) {
        throw error
      }
      
      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt)
      console.log(`Retrying LLM call in ${backoffDelay}ms...`)
      await new Promise(resolve => setTimeout(resolve, backoffDelay))
    }
  }
  
  throw lastError!
}

export async function generateLeaseContract(
  form: LeaseFormInput,
  options: GenerateLeaseContractOptions = {}
): Promise<GenerateLeaseContractResult> {
  const skipPing = options.skipConnectivityPing === true ||
    process.env.AI_SKIP_LLM_PING === "1"

  if (!skipPing) {
    try {
      const ping = await runLlmConnectivityPing()
      if (!ping.ok) {
        return { ok: false, userMessage: ping.message }
      }
    } catch (cause) {
      logLlmCallFailure("generateLeaseContract.ping", cause)
      return {
        ok: false,
        userMessage: formatLlmErrorForUser(cause),
        cause,
      }
    }
  }

  try {
    if (getLlmProviderId() === "deepseek") {
      const contract = await retryWithBackoff(() => 
        generateLeaseContractViaDeepSeekJsonObject(form, options)
      )
      const revised = await reviseLeaseContractIfLowQuality({ form, contract, options })
      return { ok: true, contract: revised }
    }

    const contract = await retryWithBackoff(async () => {
      const model = getLeaseLanguageModel("lease.generateText")
      const systemPrompt = buildLeaseSystemPromptWithRag(options.stateLawRagAppendix)
      const { output } = await generateText({
        model,
        abortSignal: options.abortSignal,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
        temperature: LLM_LEASE_AUDIT_TEMPERATURE,
        system: systemPrompt,
        prompt: buildUserPrompt(form),
        output: leaseOutput,
      })

      logLlmCallSuccess(
        "generateLeaseContract.generateText",
        JSON.stringify(output).length,
        { clauseCount: output.clauses?.length ?? 0 }
      )

      return output
    })

    const revised = await reviseLeaseContractIfLowQuality({ form, contract, options })
    return { ok: true, contract: revised }
  } catch (cause) {
    logLlmCallFailure("generateLeaseContract", cause)
    return {
      ok: false,
      userMessage: formatLlmErrorForUser(cause),
      cause,
    }
  }
}
