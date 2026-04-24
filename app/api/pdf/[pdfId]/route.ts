import { NextResponse } from "next/server"

import { getPdfBytesOnce } from "@/app/lib/pdf-cache"

export const runtime = "nodejs"
export const maxDuration = 30

export async function GET(
  _req: Request,
  context: { params: Promise<{ pdfId: string }> }
) {
  const { pdfId } = await context.params
  const id = String(pdfId ?? "").trim()
  if (!id) {
    return NextResponse.json({ error: "Missing pdf id." }, { status: 400 })
  }

  const bytes = await getPdfBytesOnce(id)
  if (!bytes) {
    return NextResponse.json(
      { error: "PDF expired or already downloaded." },
      { status: 404 }
    )
  }

  return new NextResponse(bytes as unknown as BodyInit, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="accilease.pdf"',
      "cache-control": "no-store",
    },
  })
}

