import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFPage,
  type PDFFont,
} from "pdf-lib"

import {
  type LeaseAuditReport,
} from "@/app/lib/audit"

const PAGE_W = 612
const PAGE_H = 792
const MARGIN = 54
const MAX_CHARS = 92

const FREE_WATERMARK_TEXT = "AI GENERATED"

function wrapLine(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ""
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (next.length <= maxChars) {
      cur = next
    } else {
      if (cur) lines.push(cur)
      cur = w.length > maxChars ? w.slice(0, maxChars) : w
      while (cur.length >= maxChars) {
        lines.push(cur.slice(0, maxChars))
        cur = cur.slice(maxChars)
      }
    }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : [""]
}

function drawWatermark(page: PDFPage, font: PDFFont) {
  page.drawText(FREE_WATERMARK_TEXT, {
    x: PAGE_W * 0.06,
    y: PAGE_H * 0.45,
    size: 26,
    font,
    color: rgb(0.92, 0.15, 0.15),
    rotate: degrees(-28),
    opacity: 0.22,
  })
}

function drawFooter(page: PDFPage, font: PDFFont) {
  void page
  void font
}

function riskLabel(report: LeaseAuditReport): string {
  const band =
    report.riskScore === "red"
      ? "Elevated"
      : report.riskScore === "yellow"
        ? "Moderate"
        : "Lower"
  return `${band} (${report.overallRisk} / ${report.riskScore})`
}

function displayScore(report: LeaseAuditReport): number {
  switch (report.riskScore) {
    case "red":
      return 82
    case "yellow":
      return 55
    default:
      return 28
  }
}

/**
 * Multi-page audit report PDF with diagonal watermark + footers on every page.
 */
export async function buildWatermarkedAuditReportPdf(
  report: LeaseAuditReport,
  sourceFileName: string | undefined,
  opts: { isPro: boolean }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  let page = doc.addPage([PAGE_W, PAGE_H])
  if (!opts.isPro) {
    drawWatermark(page, font)
    drawFooter(page, font)
  }
  let y = PAGE_H - MARGIN

  const need = (h: number) => {
    if (y - h < MARGIN + 40) {
      page = doc.addPage([PAGE_W, PAGE_H])
      if (!opts.isPro) {
        drawWatermark(page, font)
        drawFooter(page, font)
      }
      y = PAGE_H - MARGIN
    }
  }

  const write = (text: string, opts?: { size?: number; bold?: boolean }) => {
    const size = opts?.size ?? 10
    const f = opts?.bold ? bold : font
    const lh = size + 3
    const parts = text.split(/\n/)
    for (const part of parts) {
      for (const line of wrapLine(part, MAX_CHARS)) {
        need(lh)
        page.drawText(line, {
          x: MARGIN,
          y,
          size,
          font: f,
          color: rgb(0, 0, 0),
        })
        y -= lh
      }
    }
  }

  write("Lease contract audit report", { size: 16, bold: true })
  y -= 4
  write(
    `Generated: ${new Date().toISOString().slice(0, 10)}${sourceFileName ? `\nSource file: ${sourceFileName}` : ""}`,
    { size: 9 }
  )
  y -= 8

  write("Overall assessment", { size: 12, bold: true })
  write(
    `Risk index (display): ${displayScore(report)}/100\n${riskLabel(report)}`
  )
  y -= 6

  write("Executive summary", { size: 12, bold: true })
  write(report.summary)
  y -= 6

  write("Flagged issues", { size: 12, bold: true })
  report.issues.forEach((issue, i) => {
    write(`Issue ${i + 1}: ${issue.clause}`, { bold: true })
    write(`Risk level: ${issue.risk}`)
    write(`Analysis: ${issue.explanation}`)
    write(`Suggestion: ${issue.suggestion}`)
    write(`Law note: ${issue.stateLawReference}`)
    y -= 4
  })

  write("Recommended actions", { size: 12, bold: true })
  for (const action of report.recommendedActions) {
    write(`• ${action}`)
  }
  y -= 8

  return doc.save()
}
