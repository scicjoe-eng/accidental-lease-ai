import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFPage,
  type PDFFont,
} from "pdf-lib"

import type { LeaseContract } from "@/app/lib/ai"

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

/**
 * Build a multi-page PDF with diagonal watermark + footer disclaimer on each page.
 */
export async function buildWatermarkedLeasePdf(
  contract: LeaseContract,
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
    if (y - h < MARGIN + 36) {
      page = doc.addPage([PAGE_W, PAGE_H])
      if (!opts.isPro) {
        drawWatermark(page, font)
        drawFooter(page, font)
      }
      y = PAGE_H - MARGIN
    }
  }

  const write = (text: string, opts?: { size?: number; bold?: boolean }) => {
    const size = opts?.size ?? 11
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

  write(contract.title, { size: 15, bold: true })
  y -= 8

  write(
    `Parties\nLandlord: ${contract.parties.landlord}\nTenant(s): ${contract.parties.tenant}\nPremises: ${contract.parties.premises_address}`,
    { bold: false }
  )
  y -= 6

  const termEnd = contract.term.end_date ?? "(see notes)"
  write(
    `Term\nStart: ${contract.term.start_date}\nEnd: ${termEnd}\nMonth-to-month: ${contract.term.is_month_to_month ? "Yes" : "No"}${contract.term.notes ? `\nNotes: ${contract.term.notes}` : ""}`
  )
  y -= 6

  write(
    `Rent\nAmount: ${contract.rent.amount}${contract.rent.due ? `\nDue: ${contract.rent.due}` : ""}${contract.rent.late_fees ? `\nLate fees: ${contract.rent.late_fees}` : ""}${contract.rent.payment ? `\nPayment: ${contract.rent.payment}` : ""}`
  )
  y -= 6

  write(
    `Security deposit\nAmount: ${contract.deposit.amount}${contract.deposit.disposition ? `\nDisposition: ${contract.deposit.disposition}` : ""}`
  )
  y -= 6

  write(
    `Governing law (${contract.governing_law.state})${contract.governing_law.choice_of_law_notes ? `\n${contract.governing_law.choice_of_law_notes}` : ""}`
  )
  for (const h of contract.governing_law.state_highlights) {
    write(`• ${h}`)
  }
  y -= 8

  write("Clauses", { size: 12, bold: true })
  for (const c of contract.clauses) {
    write(`${c.title}`, { size: 11, bold: true })
    write(c.text)
    y -= 4
  }

  return doc.save()
}
