import {
  formatLlmErrorForUser,
  generateLeaseContract,
  getSignReadyMissingFields,
  leaseFormInputSchema,
  normalizeLeaseFormInput,
  LeaseContract,
} from "@/app/lib/ai"
import { getStateLawAppendixForJurisdiction } from "@/app/lib/rag"
import { buildWatermarkedLeasePdf } from "@/app/lib/lease-pdf"
import { consumeUnlockFromCookie, getUnlockStatusFromCookie } from "@/app/lib/unlock"
import { assertRateLimit } from "@/app/lib/rate-limit"
import { putPdfBytesOnce } from "@/app/lib/pdf-cache"

export const runtime = "nodejs"
export const maxDuration = 120

function buildLeasePreview(contract: LeaseContract) {
  const clausePreviewCount = 3
  const preview = {
    ...contract,
    title: `${contract.title} (Preview)`,
    governing_law: {
      ...contract.governing_law,
      state_highlights: Array.isArray(contract.governing_law?.state_highlights)
        ? contract.governing_law.state_highlights.slice(0, 2)
        : [],
    },
    clauses: Array.isArray(contract.clauses)
      ? contract.clauses.slice(0, clausePreviewCount).map((c) => ({
          ...c,
          text:
            typeof c.text === "string"
              ? c.text.slice(0, 600) + (c.text.length > 600 ? "\n\n[Locked — unlock to view full content]" : "")
              : c.text,
        }))
      : contract.clauses,
  }
  return preview
}

/**
 * Non-streaming JSON: `{ contract, pdfBase64 }` after `generateText` completes server-side.
 * API keys stay on the server.
 */
export async function POST(req: Request) {
  try {
    await assertRateLimit({ bucket: "lease_generate", limit: 6, windowSeconds: 60 })
  } catch (e) {
    const err = e as { retryAfterSeconds?: number }
    const retryAfterSeconds = Number(err?.retryAfterSeconds ?? 60)
    return Response.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429, headers: { "retry-after": String(retryAfterSeconds) } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = leaseFormInputSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed.", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const form = normalizeLeaseFormInput(parsed.data)
  const signReadyMissing = getSignReadyMissingFields(form)

  let stateLawRagAppendix: string | undefined
  try {
    stateLawRagAppendix = await getStateLawAppendixForJurisdiction(
      form.jurisdiction_state
    )
  } catch (e) {
    console.warn("[lease/generate] state law RAG skipped", e)
  }

  const gen = await generateLeaseContract(form, { stateLawRagAppendix })
  if (!gen.ok) {
    return Response.json({ error: gen.userMessage }, { status: 503 })
  }

  try {
    const unlock = await getUnlockStatusFromCookie()
    const canUnlock =
      unlock.ok && unlock.canUse === true && signReadyMissing.length === 0

    if (!canUnlock) {
      return Response.json({
        locked: true,
        missingFields: signReadyMissing,
        contractPreview: buildLeasePreview(gen.contract as Parameters<typeof buildLeasePreview>[0]),
      })
    }

    const pdfBytes = await buildWatermarkedLeasePdf(gen.contract, { isPro: true })
    const pdfId = await putPdfBytesOnce(pdfBytes, { ttlSeconds: 10 * 60 })

    // Atomically consume on first full response (A mode).
    const consumed = await consumeUnlockFromCookie()
    if (!consumed.ok || consumed.consumed !== true) {
      return Response.json({
        locked: true,
        missingFields: signReadyMissing,
        contractPreview: buildLeasePreview(gen.contract as Parameters<typeof buildLeasePreview>[0]),
      })
    }

    return Response.json({
      locked: false,
      contract: gen.contract,
      pdfId,
    })
  } catch (err) {
    console.error("[lease/generate]", err)
    return Response.json(
      { error: formatLlmErrorForUser(err) },
      { status: 500 }
    )
  }
}
