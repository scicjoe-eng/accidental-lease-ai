/**
 * PDF lease audit via text extraction + Qwen (DashScope OpenAI-compatible API).
 * **Server-only** — never import from Client Components.
 */

import { PDFParse } from "pdf-parse"
import mammoth from "mammoth"
import {
  generateText,
  Output,
  streamText,
  zodSchema,
  type StreamTextResult,
  type ToolSet,
} from "ai"
import { z } from "zod"

import {
  createLlmOpenAIClient,
  formatLlmErrorForUser,
  getAiModelId,
  getLlmProviderId,
  getQwenChatModel,
  LEASE_GENERATION_FRIENDLY_ERROR,
  LLM_ENGLISH_ONLY_SYSTEM_PREAMBLE,
  LLM_LEASE_AUDIT_TEMPERATURE,
  LLM_USER_PROMPT_ENGLISH_ONLY_SUFFIX,
  logLlmCallFailure,
  logLlmCallStartCanonical,
  logLlmCallSuccess,
} from "@/app/lib/ai"

// ─── Structured audit output ───────────────────────────────────────────────

export const leaseAuditReportSchema = z.object({
  riskScore: z.enum(["red", "yellow", "green"]),
  overallRisk: z.enum(["high", "medium", "low"]),
  issues: z.array(
    z.object({
      clause: z.string(),
      risk: z.enum(["high", "medium", "low"]),
      explanation: z.string(),
      suggestion: z.string(),
      stateLawReference: z.string(),
    })
  ),
  summary: z.string(),
  recommendedActions: z.array(z.string()),
})

export type LeaseAuditReport = z.infer<typeof leaseAuditReportSchema>

const auditLeaseOutput = Output.object({
  name: "LeasePdfAudit",
  description:
    "Structured risk audit of a U.S. residential lease for accidental landlords.",
  schema: zodSchema(leaseAuditReportSchema),
})

export const AUDIT_PDF_TEXT_TOO_SHORT =
  "We could not extract enough readable text from this PDF. It may be a scan, image-only, or encrypted file. Try uploading a text-based PDF, a clearer scan, or export the lease as PDF from Word/Google Docs."

export const AUDIT_PDF_PARSE_ERROR =
  "We could not read this PDF. The file may be corrupted, password-protected, or not a valid PDF."

/** When extraction yields almost no text (likely scan, image-only, or copy-protected). */
export const AUDIT_PDF_TEXT_LIKELY_SCAN_OR_PROTECTED =
  "This PDF may be scan-only or copy-protected. Try a text-selectable PDF or export from Word/Google Docs, or contact support."

const MIN_CHARS_SCAN_OR_PROTECTED_HINT = 100

// ─── PDF text extraction ─────────────────────────────────────────────────────

function toUint8Array(pdfInput: ArrayBuffer | Buffer): Uint8Array {
  if (pdfInput instanceof Buffer) {
    return new Uint8Array(pdfInput)
  }
  return new Uint8Array(pdfInput)
}

async function extractTextWithPdfParse(data: Uint8Array): Promise<string | null> {
  try {
    const parser = new PDFParse({ data })
    try {
      const result = await parser.getText()
      return (result.text ?? "").replace(/\s+/g, " ").trim()
    } finally {
      await parser.destroy()
    }
  } catch (err) {
    console.warn("[extractLeasePdfText] pdf-parse failed:", err)
    return null
  }
}

async function extractTextWithPdfJs(data: Uint8Array): Promise<string | null> {
  try {
    const { getDocument } = await import("pdfjs-dist")
    const loadingTask = getDocument({
      data,
      useSystemFonts: true,
      isEvalSupported: false,
      verbosity: 0,
    })
    try {
      const pdf = await loadingTask.promise
      try {
        const parts: string[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          for (const item of textContent.items) {
            if (
              item &&
              typeof item === "object" &&
              "str" in item &&
              typeof (item as { str: unknown }).str === "string"
            ) {
              const s = (item as { str: string }).str
              if (s) parts.push(s)
            }
          }
        }
        return parts.join(" ").replace(/\s+/g, " ").trim()
      } finally {
        await pdf.cleanup()
        await pdf.destroy()
      }
    } finally {
      await loadingTask.destroy()
    }
  } catch (err) {
    console.warn("[extractLeasePdfText] pdfjs-dist failed:", err)
    return null
  }
}

/**
 * Preprocess extracted text to improve quality
 */
function preprocessExtractedText(text: string): string {
  // Remove excessive whitespace
  let processed = text.replace(/\s+/g, " ").trim()
  
  // Fix common OCR errors
  processed = processed
    .replace(/\b0\b/g, "O")
    .replace(/\b1\b/g, "I")
    .replace(/\b5\b/g, "S")
    .replace(/\b8\b/g, "B")
  
  // Ensure proper spacing around punctuation
  processed = processed.replace(/([.!?,;:])([A-Za-z])/g, "$1 $2")
  
  // Remove non-printable characters
  processed = processed.replace(/[\x00-\x1F\x7F]/g, "")
  
  return processed
}

function preprocessDocxExtractedText(text: string): string {
  // DOCX text extraction is not OCR; avoid OCR-specific substitutions that can
  // corrupt numbers (rent, deposits, dates).
  let processed = text.replace(/\s+/g, " ").trim()
  processed = processed.replace(/([.!?,;:])([A-Za-z])/g, "$1 $2")
  processed = processed.replace(/[\x00-\x1F\x7F]/g, "")
  return processed
}

/**
 * Evaluate text extraction quality
 */
function evaluateExtractionQuality(text: string): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 100
  
  // Check text length
  if (text.length < 1000) {
    issues.push("Short text length")
    score -= 30
  }
  
  // Check for repetitive content
  const words = text.split(/\s+/)
  const uniqueWords = new Set(words)
  const repetitionRatio = 1 - (uniqueWords.size / words.length)
  if (repetitionRatio > 0.7) {
    issues.push("High repetition rate")
    score -= 25
  }
  
  // Check for garbage characters
  const garbageChars = text.match(/[^a-zA-Z0-9\s.,;:'"()\-]/g) || []
  const garbageRatio = garbageChars.length / text.length
  if (garbageRatio > 0.1) {
    issues.push("High garbage character rate")
    score -= 20
  }
  
  return { score: Math.max(0, score), issues }
}

/**
 * Prefer `pdf-parse`; on throw or empty string, fall back to `pdfjs-dist`.
 */
export async function extractLeasePdfText(
  pdfInput: ArrayBuffer | Buffer
): Promise<{ ok: true; text: string; quality: { score: number; issues: string[] } } | { ok: false; userMessage: string }> {
  const data = toUint8Array(pdfInput)

  let text = await extractTextWithPdfParse(data)
  let source: "pdf-parse" | "pdfjs-dist" = "pdf-parse"

  if (text === null || text.length === 0) {
    const fallback = await extractTextWithPdfJs(data)
    if (fallback === null || fallback.length === 0) {
      return { ok: false, userMessage: AUDIT_PDF_PARSE_ERROR }
    }
    text = fallback
    source = "pdfjs-dist"
  }

  // Preprocess text to improve quality
  const processedText = preprocessExtractedText(text)
  
  // Evaluate extraction quality
  const quality = evaluateExtractionQuality(processedText)
  
  console.log(
    "[extractLeasePdfText] extracted text length:",
    processedText.length,
    "source:",
    source,
    "quality score:",
    quality.score,
    "issues:",
    quality.issues
  )

  return { ok: true, text: processedText, quality }
}

// ─── DOCX text extraction ────────────────────────────────────────────────────

export const AUDIT_DOCX_PARSE_ERROR =
  "We could not read this DOCX file. The file may be corrupted, password-protected, or not a valid .docx."

export const AUDIT_DOCX_TEXT_TOO_SHORT =
  "We could not extract enough readable text from this DOCX. Try exporting again from Word/Google Docs or upload a text-based PDF."

export async function extractLeaseDocxText(
  docxInput: ArrayBuffer | Buffer
): Promise<{ ok: true; text: string; quality: { score: number; issues: string[] } } | { ok: false; userMessage: string }> {
  try {
    const buf =
      docxInput instanceof Buffer
        ? docxInput
        : Buffer.from(new Uint8Array(docxInput))
    const res = await mammoth.extractRawText({ buffer: buf })
    const raw = (res.value ?? "").trim()
    if (!raw) {
      return { ok: false, userMessage: AUDIT_DOCX_TEXT_TOO_SHORT }
    }

    const processedText = preprocessDocxExtractedText(raw)
    const quality = evaluateExtractionQuality(processedText)
    console.log(
      "[extractLeaseDocxText] extracted text length:",
      processedText.length,
      "quality score:",
      quality.score,
      "issues:",
      quality.issues
    )
    return { ok: true, text: processedText, quality }
  } catch (err) {
    console.warn("[extractLeaseDocxText] mammoth failed:", err)
    return { ok: false, userMessage: AUDIT_DOCX_PARSE_ERROR }
  }
}

// ─── Model prompts ───────────────────────────────────────────────────────────

const AUDIT_SYSTEM_PROMPT = `${LLM_ENGLISH_ONLY_SYSTEM_PREAMBLE}You are a senior U.S. residential leasing attorney (educational simulation) combined with an AI contract risk analyst, focused on **accidental landlords** — people renting property without professional property-management experience.

Your job is to review **extracted lease text** (may be partial or noisy) and produce a structured JSON risk assessment for **informational purposes only**. All narrative fields (\`summary\`, \`issues\` text, \`recommendedActions\`, \`stateLawReference\`) must be **clear professional English** — no Chinese or other non-English prose.

## Jurisdiction awareness (50 states + DC)
- Laws differ materially by **state** and sometimes **city/county** (security deposit caps & return timelines, notice to enter, eviction notices, rent control / just-cause, habitability, late fees, attorney fee clauses, lease-breaking, service animals vs pets, etc.).
- **DC** is a distinct jurisdiction.
- In \`stateLawReference\`, give **high-level pointers** (e.g. "California security deposit rules — verify current cap and return timeline with counsel") rather than inventing statute numbers or dollar caps you are not certain about.
- If the document does not name a state, infer cautiously from addresses or say "Jurisdiction unclear — verify with local counsel" and avoid fabricating locale-specific rules.

## Anti-hallucination
- If the excerpt is too vague, say so in \`summary\` and lower confidence (e.g. \`riskScore: yellow\`, \`overallRisk: medium\`).
- Never present guesses as settled law. Prefer "verify with a licensed attorney in [state]".

## Issues
Each issue must tie to **concrete risks** for accidental landlords, e.g.:
- Security deposit exceeds or may exceed **typical** state/local limits or omits return mechanics
- Harsh or one-sided **early termination** / lock-in with no mitigation options
- **Maintenance / habitability** duties unclear or shifted unfairly
- **Eviction** / cure periods / notice inconsistent with common state frameworks (flag for attorney review)
- **Rent control** or **just-cause** hotspots if the property plausibly sits in such a jurisdiction
- **Pet / ESA** language that may conflict with fair housing norms (stay high-level)
- **Attorney fee** one-way clauses, **waiver of jury**, excessive **late fees**, **holdover** rent multipliers

Populate \`recommendedActions\` with practical next steps (e.g. "Have counsel compare deposit clause to [state] rules", "Add explicit repair request process").

Tone: professional, concise, U.S. legal-education style — **English only** throughout.`

/** DeepSeek accepts \`json_object\` but not OpenAI-style \`json_schema\`; reinforce JSON-only output. */
const AUDIT_SYSTEM_PROMPT_JSON_OBJECT = `${AUDIT_SYSTEM_PROMPT}

## Output encoding
Return **one JSON object only** (no markdown fences, no commentary before or after).

Use **exactly** these English property names (models often drift without this list):
- Top level: \`riskScore\`, \`overallRisk\`, \`issues\`, \`summary\`, \`recommendedActions\`.
- Each object in \`issues\` MUST have: \`clause\`, \`risk\`, \`explanation\`, \`suggestion\`, \`stateLawReference\`.
- \`risk\` per issue must be lowercase English: \`high\`, \`medium\`, or \`low\` only.
- \`riskScore\` must be \`red\`, \`yellow\`, or \`green\`.
- \`overallRisk\` must be lowercase English: \`high\`, \`medium\`, or \`low\` (holistic summary band, not identical to every issue).`

function stripMarkdownJsonFence(raw: string): string {
  let s = raw.trim()
  const m = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i.exec(s)
  if (m) s = m[1].trim()
  return s
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v !== null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>
  }
  return null
}

function firstNonEmptyString(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "string") {
      const t = v.trim()
      if (t) return t
    } else if (typeof v === "number" && Number.isFinite(v)) {
      return String(v)
    }
  }
  return ""
}

function normalizeIssueRisk(raw: unknown): "high" | "medium" | "low" {
  if (raw == null) return "medium"
  if (typeof raw === "number") {
    if (raw <= 1) return "low"
    if (raw === 2) return "medium"
    return "high"
  }
  const s = String(raw).trim().toLowerCase()
  if (
    s === "high" ||
    s === "h" ||
    s === "severe" ||
    s === "major" ||
    s === "高"
  ) {
    return "high"
  }
  if (s === "low" || s === "l" || s === "minor" || s === "低") {
    return "low"
  }
  if (
    s === "medium" ||
    s === "m" ||
    s === "moderate" ||
    s === "中" ||
    s === "med"
  ) {
    return "medium"
  }
  return "medium"
}

function normalizeRiskScore(raw: unknown): "red" | "yellow" | "green" {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
  if (s === "red" || s === "yellow" || s === "green") {
    return s
  }
  if (s === "红" || s.includes("高")) return "red"
  if (s === "黄") return "yellow"
  if (s === "绿") return "green"
  return "yellow"
}

function normalizeOverallRisk(raw: unknown): "high" | "medium" | "low" {
  const s = String(raw ?? "").trim()
  const lower = s.toLowerCase()
  if (s === "高" || lower === "high" || lower === "h") return "high"
  if (s === "低" || lower === "low" || lower === "l") return "low"
  if (
    s === "中" ||
    lower === "medium" ||
    lower === "m" ||
    lower === "med" ||
    lower === "moderate"
  ) {
    return "medium"
  }
  return "medium"
}

function normalizeRecommendedActions(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === "string" ? x.trim() : String(x)))
      .filter((x) => x.length > 0)
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/\n|;|；|•/)
      .map((line) => line.replace(/^[\s\d.\-–—*]+/, "").trim())
      .filter(Boolean)
  }
  return []
}

function normalizeIssueItem(item: unknown): LeaseAuditReport["issues"][number] {
  const o = asRecord(item) ?? {}
  return {
    clause: firstNonEmptyString(
      o.clause,
      o.clauseSummary,
      o.title,
      o.issue,
      o.concern,
      o.topic,
      o.section,
      o.name,
      o.label,
      o.条款,
      o.问题,
      o.条款摘要
    ),
    risk: normalizeIssueRisk(o.risk ?? o.severity ?? o.level ?? o.风险),
    explanation: firstNonEmptyString(
      o.explanation,
      o.analysis,
      o.description,
      o.detail,
      o.rationale,
      o.说明,
      o.解释,
      o.notes
    ),
    suggestion: firstNonEmptyString(
      o.suggestion,
      o.recommendation,
      o.mitigation,
      o.action,
      o.actions,
      o.fix,
      o.建议,
      o.改进建议
    ),
    stateLawReference: firstNonEmptyString(
      o.stateLawReference,
      o.law,
      o.legalReference,
      o.statute,
      o.jurisdiction,
      o.reference,
      o.法律依据,
      o.state_law
    ),
  }
}

/**
 * \`json_object\` mode does not enforce a schema; models often use alternate keys.
 * Coerce to the shape expected by {@link leaseAuditReportSchema}.
 */
function normalizeRawAuditJson(data: unknown): LeaseAuditReport {
  const root = asRecord(data)
  if (!root) {
    throw new Error("Audit model output must be a JSON object.")
  }

  const issuesRaw = root.issues
  const issuesList = Array.isArray(issuesRaw) ? issuesRaw : []

  return {
    riskScore: normalizeRiskScore(root.riskScore),
    overallRisk: normalizeOverallRisk(root.overallRisk),
    issues: issuesList.map(normalizeIssueItem),
    summary: firstNonEmptyString(
      root.summary,
      root.overview,
      root.abstract,
      root.conclusion
    ),
    recommendedActions: normalizeRecommendedActions(
      root.recommendedActions ?? root.actions ?? root.nextSteps ?? root.建议
    ),
  }
}

/**
 * Validate audit report quality
 */
function validateAuditReportQuality(report: LeaseAuditReport): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 100
  
  // Check for minimum number of issues
  if (report.issues.length === 0) {
    issues.push("No issues identified in audit")
    score -= 20
  }
  
  // Check for reasonable issue details
  for (let i = 0; i < report.issues.length; i++) {
    const issue = report.issues[i]
    if (!issue.clause || issue.clause.length < 5) {
      issues.push(`Issue ${i + 1} has insufficient clause description`)
      score -= 5
    }
    if (!issue.explanation || issue.explanation.length < 20) {
      issues.push(`Issue ${i + 1} has insufficient explanation`)
      score -= 5
    }
    if (!issue.suggestion || issue.suggestion.length < 10) {
      issues.push(`Issue ${i + 1} has insufficient suggestion`)
      score -= 5
    }
  }
  
  // Check for summary
  if (!report.summary || report.summary.length < 50) {
    issues.push("Audit summary is too short")
    score -= 15
  }
  
  // Check for recommended actions
  if (report.recommendedActions.length === 0) {
    issues.push("No recommended actions provided")
    score -= 15
  }
  
  return { score: Math.max(0, score), issues }
}

function parseLeaseAuditReportFromModelJson(raw: string): LeaseAuditReport {
  const s = stripMarkdownJsonFence(raw)
  const data: unknown = JSON.parse(s)
  const coerced = normalizeRawAuditJson(data)
  const report = leaseAuditReportSchema.parse(coerced)
  
  // Validate report quality
  const quality = validateAuditReportQuality(report)
  console.log("Audit report quality score:", quality.score, "issues:", quality.issues)
  
  return report
}

async function auditLeasePdfViaDeepSeekJsonObject(
  userPrompt: string,
  options: Pick<AuditLeasePdfOptions, "abortSignal" | "maxOutputTokens">
): Promise<LeaseAuditReport> {
  logLlmCallStartCanonical({ callerContext: "audit.generateText" })

  const openai = createLlmOpenAIClient()
  const model = getAiModelId()
  const maxTokens = options.maxOutputTokens ?? 8192

  const createOpts: Parameters<
    typeof openai.chat.completions.create
  >[1] = {}
  if (options.abortSignal) createOpts.signal = options.abortSignal

  const res = await openai.chat.completions.create(
    {
      model,
      messages: [
        { role: "system", content: AUDIT_SYSTEM_PROMPT_JSON_OBJECT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: LLM_LEASE_AUDIT_TEMPERATURE,
      response_format: { type: "json_object" },
    },
    createOpts
  )

  const raw = res.choices[0]?.message?.content?.trim() ?? ""
  if (!raw) {
    throw new Error("Empty completion from lease audit (DeepSeek json_object).")
  }

  return parseLeaseAuditReportFromModelJson(raw)
}

function buildAuditUserPrompt(args: {
  leaseText: string
  truncated: boolean
  sourceLabel: "PDF" | "DOCX" | "document"
  jurisdictionHint?: string
}): string {
  const hint = args.jurisdictionHint?.trim()
    ? `\nUser hint — likely jurisdiction: ${args.jurisdictionHint.trim()}\n`
    : ""
  const trunc = args.truncated
    ? "\nNOTE: Only the beginning of the document was sent due to length limits. Flag gaps in your summary.\n"
    : ""
  return `${hint}${trunc}
--- BEGIN LEASE TEXT (extracted from ${args.sourceLabel}) ---
${args.leaseText}
--- END LEASE TEXT ---

${LLM_USER_PROMPT_ENGLISH_ONLY_SUFFIX}`
}

// ─── Public API ─────────────────────────────────────────────────────────────

export type AuditLeasePdfOptions = {
  abortSignal?: AbortSignal
  /** Default 200. Below this, the model is not called. */
  minExtractedChars?: number
  /** Default 90_000. Longer text is truncated with a warning in the prompt. */
  maxPromptChars?: number
  maxOutputTokens?: number
  /** If true, returns \`streamText\` result; if false (default), awaits full report. */
  stream?: boolean
  /** Optional state / city hint from the uploader. */
  jurisdictionHint?: string
}

export type AuditLeasePdfFailure = {
  ok: false
  userMessage: string
  cause?: unknown
}

export type AuditLeasePdfSuccessSync = {
  ok: true
  stream: false
  report: LeaseAuditReport
  extractedTextLength: number
  truncated: boolean
}

export type AuditLeasePdfSuccessStream = {
  ok: true
  stream: true
  streamResult: StreamTextResult<ToolSet, typeof auditLeaseOutput>
  extractedTextLength: number
  truncated: boolean
}

export type AuditLeasePdfResult =
  | AuditLeasePdfFailure
  | AuditLeasePdfSuccessSync
  | AuditLeasePdfSuccessStream

type AuditLeaseTextOptions = AuditLeasePdfOptions

/**
 * Extract text from a lease PDF, then audit with Qwen 3.6 Plus (same DashScope config as \`app/lib/ai.ts\`).
 *
 * - \`stream: false\` — await a full structured \`LeaseAuditReport\`.
 * - \`stream: true\` — return \`streamResult\` (\`partialOutputStream\`, \`output\`, etc.).
 */
export async function auditLeasePDF(
  pdfInput: ArrayBuffer | Buffer,
  options: AuditLeasePdfOptions = {}
): Promise<AuditLeasePdfResult> {
  const minChars = options.minExtractedChars ?? 200
  const maxChars = options.maxPromptChars ?? 90_000

  const extracted = await extractLeasePdfText(pdfInput)
  if (!extracted.ok) {
    return { ok: false, userMessage: extracted.userMessage }
  }

  console.log("[auditLeasePDF] extracted text length:", extracted.text.length, "quality score:", extracted.quality.score)

  if (extracted.text.length < MIN_CHARS_SCAN_OR_PROTECTED_HINT) {
    return { ok: false, userMessage: AUDIT_PDF_TEXT_LIKELY_SCAN_OR_PROTECTED }
  }

  if (extracted.text.length < minChars) {
    return { ok: false, userMessage: AUDIT_PDF_TEXT_TOO_SHORT }
  }

  const truncated = extracted.text.length > maxChars
  const leaseText = truncated
    ? extracted.text.slice(0, maxChars)
    : extracted.text

  const userPrompt = buildAuditUserPrompt({
    leaseText,
    truncated,
    sourceLabel: "PDF",
    jurisdictionHint: options.jurisdictionHint,
  })

  // Add quality warning to user prompt if extraction quality is low
  const qualityWarning =
    extracted.quality.score < 50
      ? `\nNOTE: Text extraction quality is low (score: ${extracted.quality.score}). Some information may be missing or inaccurate.\n`
      : ""

  try {
    if (options.stream) {
      if (getLlmProviderId() === "deepseek") {
        return {
          ok: false,
          userMessage:
            "Streaming PDF audit is not available with the default DeepSeek provider. Use AI_PROVIDER=dashscope or turn off streaming.",
        }
      }
      const streamResult = streamText({
        model: getQwenChatModel("streamText"),
        abortSignal: options.abortSignal,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
        temperature: LLM_LEASE_AUDIT_TEMPERATURE,
        system: AUDIT_SYSTEM_PROMPT,
        prompt: userPrompt + qualityWarning,
        output: auditLeaseOutput,
        onFinish: (event) => {
          logLlmCallSuccess("auditLeasePDF.streamText", event.text?.length ?? 0, {
            finishReason: event.finishReason,
            usage: event.totalUsage,
          })
        },
        onError: ({ error }) => {
          logLlmCallFailure("auditLeasePDF.streamText", error)
        },
      })
      return {
        ok: true,
        stream: true,
        streamResult,
        extractedTextLength: extracted.text.length,
        truncated,
      }
    }

    let report: LeaseAuditReport

    if (getLlmProviderId() === "deepseek") {
      report = await auditLeasePdfViaDeepSeekJsonObject(userPrompt + qualityWarning, options)
    } else {
      const { output } = await generateText({
        model: getQwenChatModel("generateText"),
        abortSignal: options.abortSignal,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
        temperature: LLM_LEASE_AUDIT_TEMPERATURE,
        system: AUDIT_SYSTEM_PROMPT,
        prompt: userPrompt + qualityWarning,
        output: auditLeaseOutput,
      })
      report = output
    }

    logLlmCallSuccess(
      "auditLeasePDF.generateText",
      JSON.stringify(report).length,
      { issueCount: report.issues?.length ?? 0, extractionQualityScore: extracted.quality.score }
    )

    return {
      ok: true,
      stream: false,
      report,
      extractedTextLength: extracted.text.length,
      truncated,
    }
  } catch (cause) {
    logLlmCallFailure("auditLeasePDF", cause)
    const detail = formatLlmErrorForUser(cause)
    const userMessage =
      detail && detail !== LEASE_GENERATION_FRIENDLY_ERROR
        ? `Audit failed: ${detail}`
        : LEASE_GENERATION_FRIENDLY_ERROR
    return {
      ok: false,
      userMessage,
      cause,
    }
  }
}

export type AuditLeaseDocxResult = AuditLeasePdfResult

export async function auditLeaseDOCX(
  docxInput: ArrayBuffer | Buffer,
  options: AuditLeaseTextOptions = {}
): Promise<AuditLeaseDocxResult> {
  const minChars = options.minExtractedChars ?? 200
  const maxChars = options.maxPromptChars ?? 90_000

  const extracted = await extractLeaseDocxText(docxInput)
  if (!extracted.ok) {
    return { ok: false, userMessage: extracted.userMessage }
  }

  if (extracted.text.length < minChars) {
    return { ok: false, userMessage: AUDIT_DOCX_TEXT_TOO_SHORT }
  }

  const truncated = extracted.text.length > maxChars
  const leaseText = truncated ? extracted.text.slice(0, maxChars) : extracted.text

  const userPrompt = buildAuditUserPrompt({
    leaseText,
    truncated,
    sourceLabel: "DOCX",
    jurisdictionHint: options.jurisdictionHint,
  })

  const qualityWarning =
    extracted.quality.score < 50
      ? `\nNOTE: Text extraction quality is low (score: ${extracted.quality.score}). Some information may be missing or inaccurate.\n`
      : ""

  try {
    if (options.stream) {
      if (getLlmProviderId() === "deepseek") {
        return {
          ok: false,
          userMessage:
            "Streaming DOCX audit is not available with the default DeepSeek provider. Use AI_PROVIDER=dashscope or turn off streaming.",
        }
      }
      const streamResult = streamText({
        model: getQwenChatModel("streamText"),
        abortSignal: options.abortSignal,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
        temperature: LLM_LEASE_AUDIT_TEMPERATURE,
        system: AUDIT_SYSTEM_PROMPT,
        prompt: userPrompt + qualityWarning,
        output: auditLeaseOutput,
        onFinish: (event) => {
          logLlmCallSuccess("auditLeaseDOCX.streamText", event.text?.length ?? 0, {
            finishReason: event.finishReason,
            usage: event.totalUsage,
          })
        },
        onError: ({ error }) => {
          logLlmCallFailure("auditLeaseDOCX.streamText", error)
        },
      })
      return {
        ok: true,
        stream: true,
        streamResult,
        extractedTextLength: extracted.text.length,
        truncated,
      }
    }

    let report: LeaseAuditReport

    if (getLlmProviderId() === "deepseek") {
      report = await auditLeasePdfViaDeepSeekJsonObject(userPrompt + qualityWarning, options)
    } else {
      const { output } = await generateText({
        model: getQwenChatModel("generateText"),
        abortSignal: options.abortSignal,
        maxOutputTokens: options.maxOutputTokens ?? 8192,
        temperature: LLM_LEASE_AUDIT_TEMPERATURE,
        system: AUDIT_SYSTEM_PROMPT,
        prompt: userPrompt + qualityWarning,
        output: auditLeaseOutput,
      })
      report = output
    }

    logLlmCallSuccess(
      "auditLeaseDOCX.generateText",
      JSON.stringify(report).length,
      { issueCount: report.issues?.length ?? 0, extractionQualityScore: extracted.quality.score }
    )

    return {
      ok: true,
      stream: false,
      report,
      extractedTextLength: extracted.text.length,
      truncated,
    }
  } catch (cause) {
    logLlmCallFailure("auditLeaseDOCX", cause)
    const detail = formatLlmErrorForUser(cause)
    const userMessage =
      detail && detail !== LEASE_GENERATION_FRIENDLY_ERROR
        ? `Audit failed: ${detail}`
        : LEASE_GENERATION_FRIENDLY_ERROR
    return {
      ok: false,
      userMessage,
      cause,
    }
  }
}
