/**
 * State landlord–tenant law RAG helpers. **Server-only** (uses service role).
 * Import script `script/import-laws.ts` reuses embedding + payload helpers.
 */

import OpenAI from "openai"

import { createServiceRoleSupabase } from "@/app/lib/supabase-service"

const LOG_PREFIX = "[rag]"

/** Fields stored in `key_clauses` JSONB (aligned with dataset schema). */
export const STATE_LAW_KEY_CLAUSE_KEYS = [
  "security_deposit",
  "eviction",
  "rent_control",
  "habitability",
  "lease_termination",
  "late_fees",
  "landlord_entry",
  "disclosures",
  "rent_increase",
] as const

function buildContentFromJurisdictionJson(j: Record<string, unknown>): string {
  const state = String(j.state ?? "")
  const code = String(j.state_code ?? "").toUpperCase()
  const parts: string[] = [`${state} (${code})`]

  for (const k of [
    "title",
    "governing_statutes",
    "last_updated",
  ] as const) {
    const v = j[k]
    if (typeof v === "string" && v.trim()) parts.push(`${k}: ${v.trim()}`)
  }

  for (const [k, v] of Object.entries(j)) {
    if (k.endsWith("_section") && typeof v === "string" && v.trim()) {
      parts.push(`\n## ${k.replace(/_section$/, "").replace(/_/g, " ")}\n${v.trim()}`)
    }
  }

  const structured: Record<string, unknown> = {}
  for (const key of STATE_LAW_KEY_CLAUSE_KEYS) {
    const v = j[key]
    if (v !== undefined && v !== null) structured[key] = v
  }
  if (Object.keys(structured).length > 0) {
    parts.push(
      "\n## Structured fields\n",
      JSON.stringify(structured, null, 2)
    )
  }

  let text = parts.join("\n")
  if (text.length > 80_000) {
    text = text.slice(0, 80_000) + "\n[truncated for storage]"
  }
  return text
}

/**
 * Normalize one `jurisdictions[]` entry from `state_laws.json` for DB upsert.
 */
export function buildStateLawImportPayload(j: Record<string, unknown>): {
  state_code: string
  state_name: string
  content: string
  key_clauses: Record<string, unknown>
} {
  const state_code = String(j.state_code ?? "")
    .trim()
    .toUpperCase()
  const state_name = String(j.state ?? "").trim()
  if (!/^[A-Z]{2}$/.test(state_code)) {
    throw new Error(`Invalid state_code on ${state_name}: ${state_code}`)
  }

  const key_clauses: Record<string, unknown> = {}
  for (const key of STATE_LAW_KEY_CLAUSE_KEYS) {
    const v = j[key]
    if (v !== undefined && v !== null) key_clauses[key] = v
  }

  return {
    state_code,
    state_name,
    content: buildContentFromJurisdictionJson(j),
    key_clauses,
  }
}

export type StateLawRow = {
  id?: string
  state_code: string
  state_name: string
  content: string
  key_clauses: Record<string, unknown>
}

/** Max chars sent to the lease model to control tokens. */
const PROMPT_APPENDIX_MAX_CHARS = 14_000

/**
 * Parse labels like `California (CA)` or bare `CA` / `DC`.
 */
export function extractStateCodeFromJurisdiction(input: string): string | null {
  const t = input.trim()
  if (!t) return null
  const paren = /\(([A-Za-z]{2})\)\s*$/.exec(t)
  if (paren) return paren[1].toUpperCase()
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase()
  const lower = t.toLowerCase()
  if (lower.includes("district of columbia") || lower === "dc" || lower === "d.c.")
    return "DC"
  return null
}

function normalizeStateCode(code: string): string {
  const c = code.trim().toUpperCase()
  if (c === "DISTRICT OF COLUMBIA") return "DC"
  if (/^[A-Z]{2}$/.test(c)) return c
  return c
}

// Cache for state law data to improve performance
const stateLawCache = new Map<string, {
  data: StateLawRow
  timestamp: number
}>()

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

/**
 * Fetch a row from `state_laws` by `state_code` (e.g. `CA`, `DC`).
 * Returns `content` + `key_clauses` for prompting and display.
 */
export async function retrieveStateLaw(
  stateCode: string
): Promise<StateLawRow | null> {
  const code = normalizeStateCode(stateCode)
  if (!/^[A-Z]{2}$/.test(code)) {
    console.warn(LOG_PREFIX, "invalid state_code", stateCode)
    return null
  }

  // Check cache first
  const cached = stateLawCache.get(code)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION) {
    console.log(LOG_PREFIX, "retrieveStateLaw from cache", code)
    return cached.data
  }

  try {
    const supabase = createServiceRoleSupabase()
    const { data, error } = await supabase
      .from("state_laws")
      .select("state_code, state_name, content, key_clauses")
      .eq("state_code", code)
      .maybeSingle()

    if (error) {
      console.error(LOG_PREFIX, "retrieveStateLaw query error", code, error.message)
      return null
    }
    if (!data) {
      console.warn(LOG_PREFIX, "no row for state_code", code)
      return null
    }

    const result: StateLawRow = {
      state_code: data.state_code as string,
      state_name: data.state_name as string,
      content: (data.content as string) ?? "",
      key_clauses: (data.key_clauses as Record<string, unknown>) ?? {},
    }

    // Update cache
    stateLawCache.set(code, {
      data: result,
      timestamp: Date.now()
    })

    return result
  } catch (e) {
    console.error(LOG_PREFIX, "retrieveStateLaw failed", code, e)
    return null
  }
}

/**
 * Build a single string for the lease system prompt from a DB row.
 */
export function formatStateLawForPrompt(row: StateLawRow): string {
  // Keep the appendix compact and actionable. The lease model primarily needs:
  // - structured key_clauses (now quite detailed in your dataset)
  // - a small set of human-readable reminders to avoid drifting into generic terms
  const clausesJson = JSON.stringify(row.key_clauses ?? {}, null, 2)

  const parts = [
    `# Jurisdiction: ${row.state_name} (${row.state_code})`,
    "",
    "## How to use this reference (AcciLease)",
    "- Treat this as jurisdiction-specific constraints and drafting hints.",
    "- Prefer these facts over generic lease language.",
    "- If a field is marked \"varies\", keep the clause high-level and advise counsel review.",
    "",
    "## Structured key_clauses (JSON)",
    clausesJson,
  ]

  let text = parts.join("\n")
  if (text.length > PROMPT_APPENDIX_MAX_CHARS) {
    text =
      text.slice(0, PROMPT_APPENDIX_MAX_CHARS) +
      "\n\n[…truncated for model context; full data in AcciLease dataset…]"
  }
  return text
}

/**
 * Resolve the combobox label (e.g. `California (CA)`) into a prompt appendix string.
 * Returns `undefined` if parsing fails, Supabase is misconfigured, or the row is missing.
 */
export async function getStateLawAppendixForJurisdiction(
  jurisdictionLabel: string
): Promise<string | undefined> {
  const code = extractStateCodeFromJurisdiction(jurisdictionLabel)
  if (!code) {
    console.warn(
      LOG_PREFIX,
      "getStateLawAppendix: could not parse state from jurisdiction label",
      JSON.stringify(jurisdictionLabel)
    )
    return undefined
  }
  try {
    const row = await retrieveStateLaw(code)
    if (!row) return undefined
    if (process.env.NODE_ENV === "development") {
      console.log(
        LOG_PREFIX,
        "getStateLawAppendix: loaded",
        row.state_code,
        row.state_name
      )
    }
    return formatStateLawForPrompt(row)
  } catch (e) {
    console.error(LOG_PREFIX, "getStateLawAppendix failed", code, e)
    return undefined
  }
}

/**
 * Validate state law data for completeness and accuracy
 */
export function validateStateLawData(row: StateLawRow): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Check for required fields
  if (!row.state_code) issues.push("Missing state_code")
  if (!row.state_name) issues.push("Missing state_name")
  if (!row.content) issues.push("Missing content")
  
  // Check for key clauses
  const requiredClauses = ["security_deposit", "eviction", "habitability"]
  for (const clause of requiredClauses) {
    if (!row.key_clauses[clause]) {
      issues.push(`Missing key clause: ${clause}`)
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}

/**
 * Get state law data with validation
 */
export async function getValidatedStateLaw(code: string): Promise<{ row: StateLawRow | null; validation: { valid: boolean; issues: string[] } }> {
  const row = await retrieveStateLaw(code)
  if (!row) {
    return { row: null, validation: { valid: false, issues: ["State law data not found"] } }
  }
  
  const validation = validateStateLawData(row)
  return { row, validation }
}

/**
 * RAG data version information
 */
export type RagDataVersion = {
  version: string
  lastUpdated: string
  stateCount: number
}

/**
 * Get RAG data version information
 */
export async function getRagDataVersion(): Promise<RagDataVersion | null> {
  try {
    const supabase = createServiceRoleSupabase()
    
    // Get version info from a metadata table (if exists)
    const { data: metadata } = await supabase
      .from("state_laws_metadata")
      .select("version, last_updated")
      .maybeSingle()
    
    // Get count of states
    const { count, error: countError } = await supabase
      .from("state_laws")
      .select("id", { count: 'exact', head: true })
    
    if (countError) {
      console.error(LOG_PREFIX, "getRagDataVersion count error", countError.message)
      return null
    }
    
    return {
      version: metadata?.version || "1.0",
      lastUpdated: metadata?.last_updated || new Date().toISOString(),
      stateCount: count || 0
    }
  } catch (e) {
    console.error(LOG_PREFIX, "getRagDataVersion failed", e)
    return null
  }
}

/**
 * Check if RAG data needs update
 */
export async function checkRagDataUpdate(): Promise<{ needsUpdate: boolean; reason?: string }> {
  const version = await getRagDataVersion()
  if (!version) {
    return { needsUpdate: true, reason: "No version information available" }
  }
  
  // Check if data is older than 90 days
  const lastUpdated = new Date(version.lastUpdated)
  const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceUpdate > 90) {
    return { needsUpdate: true, reason: "Data is more than 90 days old" }
  }
  
  // Check if all 50 states + DC are present
  if (version.stateCount < 51) {
    return { needsUpdate: true, reason: "Missing state law data" }
  }
  
  return { needsUpdate: false }
}

/**
 * Generate a 1536-d embedding using OpenAI `text-embedding-3-small`.
 * Set `OPENAI_API_KEY`. DeepSeek does not expose a compatible embedding API in most accounts.
 */
export async function embedStateLawContent(text: string): Promise<number[]> {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) {
    throw new Error("OPENAI_API_KEY is required for embeddings (text-embedding-3-small).")
  }
  const openai = new OpenAI({ apiKey: key })
  const input = text.length > 30_000 ? text.slice(0, 30_000) : text
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
    dimensions: 1536,
  })
  const vec = res.data[0]?.embedding
  if (!vec || vec.length !== 1536) {
    throw new Error(`Expected 1536-d embedding, got ${vec?.length ?? 0}`)
  }
  return vec
}
