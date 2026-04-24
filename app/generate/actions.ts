"use server"

import {
  formatLlmErrorForUser,
  generateLeaseContract,
  getSignReadyMissingFields,
  leaseFormInputSchema,
  normalizeLeaseFormInput,
} from "@/app/lib/ai"
import { getStateLawAppendixForJurisdiction } from "@/app/lib/rag"
import { buildWatermarkedLeasePdf } from "@/app/lib/lease-pdf"
import { consumeUnlockFromCookie, getUnlockStatusFromCookie } from "@/app/lib/unlock"
import { putPdfBytesOnce } from "@/app/lib/pdf-cache"

import type { LeaseContract } from "@/app/lib/ai"

export type GenerateLeasePdfActionResult =
  | {
      ok: true
      locked: false
      contract: LeaseContract
      pdfId: string
    }
  | {
      ok: true
      locked: true
      contractPreview: LeaseContract
      missingFields: string[]
    }
  | {
      ok: false
      error: string
    }

function buildLeasePreview(contract: LeaseContract): LeaseContract {
  const clausePreviewCount = 3
  return {
    ...contract,
    title: `${contract.title} (Preview)`,
    governing_law: {
      ...contract.governing_law,
      state_highlights: Array.isArray(contract.governing_law?.state_highlights)
        ? contract.governing_law.state_highlights.slice(0, 2)
        : [],
    },
    clauses: contract.clauses.slice(0, clausePreviewCount).map((c) => ({
      ...c,
      text:
        c.text.slice(0, 600) +
        (c.text.length > 600 ? "\n\n[Locked — unlock to view full content]" : ""),
    })),
  }
}

/**
 * Non-streaming path: runs Qwen on the server and returns PDF (base64).
 * Use when live JSON preview is not needed.
 */
export async function generateLeasePdfAction(
  raw: unknown
): Promise<GenerateLeasePdfActionResult> {
  const parsed = leaseFormInputSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for missing or invalid fields." }
  }

  const form = normalizeLeaseFormInput(parsed.data)
  const missing = getSignReadyMissingFields(form)
  let stateLawRagAppendix: string | undefined
  try {
    stateLawRagAppendix = await getStateLawAppendixForJurisdiction(
      form.jurisdiction_state
    )
  } catch (e) {
    console.warn("[generateLeasePdfAction] state law RAG skipped", e)
  }

  const gen = await generateLeaseContract(form, { stateLawRagAppendix })
  if (!gen.ok) {
    return { ok: false, error: gen.userMessage }
  }

  try {
    const contract = gen.contract
    const unlock = await getUnlockStatusFromCookie()
    const canUnlock = unlock.ok && unlock.canUse === true && missing.length === 0

    if (!canUnlock) {
      return {
        ok: true,
        locked: true,
        missingFields: missing,
        contractPreview: buildLeasePreview(contract),
      }
    }

    const pdfBytes = await buildWatermarkedLeasePdf(contract, { isPro: true })
    const pdfId = await putPdfBytesOnce(pdfBytes, { ttlSeconds: 10 * 60 })
    const consumed = await consumeUnlockFromCookie()
    if (!consumed.ok || consumed.consumed !== true) {
      return {
        ok: true,
        locked: true,
        missingFields: missing,
        contractPreview: buildLeasePreview(contract),
      }
    }
    return { ok: true, locked: false, contract, pdfId }
  } catch (err: unknown) {
    console.error("[generateLeasePdfAction]", err)
    return { ok: false, error: formatLlmErrorForUser(err) }
  }
}
