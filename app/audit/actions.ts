"use server"

import { auditLeaseDOCX, auditLeasePDF } from "@/app/lib/audit"
import { buildWatermarkedAuditReportPdf } from "@/app/lib/audit-report-pdf"
import { consumeUnlockFromCookie, getUnlockStatusFromCookie } from "@/app/lib/unlock"
import { assertRateLimit } from "@/app/lib/rate-limit"
import { putPdfBytesOnce } from "@/app/lib/pdf-cache"

import type { LeaseAuditReport } from "@/app/lib/audit"

const MAX_BYTES = 10 * 1024 * 1024

export type RunLeaseAuditActionResult =
  | {
      ok: true
      report: LeaseAuditReport
      pdfId?: string
      locked: boolean
      extractedTextLength: number
      truncated: boolean
    }
  | {
      ok: false
      error: string
    }

function buildAuditPreview(report: LeaseAuditReport): LeaseAuditReport {
  return {
    ...report,
    issues: report.issues.slice(0, 3).map((i) => ({
      ...i,
      explanation:
        i.explanation.slice(0, 260) +
        (i.explanation.length > 260 ? " … [Locked]" : ""),
      suggestion:
        i.suggestion.slice(0, 160) + (i.suggestion.length > 160 ? " … [Locked]" : ""),
    })),
    recommendedActions: report.recommendedActions.slice(0, 3),
    summary:
      report.summary.slice(0, 380) + (report.summary.length > 380 ? " … [Locked]" : ""),
  }
}

export async function runLeaseAuditAction(
  formData: FormData
): Promise<RunLeaseAuditActionResult> {
  try {
    await assertRateLimit({ bucket: "lease_audit", limit: 4, windowSeconds: 60 })
  } catch (e) {
    return { ok: false, error: "Too many requests. Please try again in a moment." }
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return { ok: false, error: "Upload a PDF or DOCX file to continue." }
  }

  const lowerName = file.name.toLowerCase()
  const isPdf =
    file.type === "application/pdf" || lowerName.endsWith(".pdf")
  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  if (!isPdf && !isDocx) {
    return { ok: false, error: "Only PDF and DOCX files are supported." }
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File must be 10MB or smaller." }
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const result = isDocx
    ? await auditLeaseDOCX(buf, { stream: false })
    : await auditLeasePDF(buf, { stream: false })

  if (!result.ok) {
    return { ok: false, error: result.userMessage }
  }

  if (result.stream) {
    return { ok: false, error: "Unexpected streaming response from audit." }
  }

  try {
    const unlock = await getUnlockStatusFromCookie()
    const canUnlock = unlock.ok && unlock.canUse === true

    if (!canUnlock) {
      return {
        ok: true,
        locked: true,
        report: buildAuditPreview(result.report),
        extractedTextLength: result.extractedTextLength,
        truncated: result.truncated,
      }
    }

    const pdfBytes = await buildWatermarkedAuditReportPdf(result.report, file.name, {
      isPro: true,
    })
    const pdfId = await putPdfBytesOnce(pdfBytes, { ttlSeconds: 10 * 60 })

    const consumed = await consumeUnlockFromCookie()
    if (!consumed.ok || consumed.consumed !== true) {
      return {
        ok: true,
        locked: true,
        report: buildAuditPreview(result.report),
        extractedTextLength: result.extractedTextLength,
        truncated: result.truncated,
      }
    }

    return {
      ok: true,
      locked: false,
      report: result.report,
      pdfId,
      extractedTextLength: result.extractedTextLength,
      truncated: result.truncated,
    }
  } catch (err) {
    console.error("[runLeaseAuditAction] buildWatermarkedAuditReportPdf:", err)
    return {
      ok: false,
      error:
        err instanceof Error && err.message
          ? `Could not build audit PDF: ${err.message}`
          : "We could not build the audit PDF. Please try again.",
    }
  }
}
