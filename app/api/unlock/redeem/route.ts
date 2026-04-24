import { NextResponse } from "next/server"

import { redeemUnlockSession } from "@/app/lib/unlock"
import { assertRateLimit } from "@/app/lib/rate-limit"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    await assertRateLimit({ bucket: "unlock_redeem", limit: 5, windowSeconds: 60 })
  } catch (e) {
    const err = e as { retryAfterSeconds?: number }
    const retryAfterSeconds = Number(err?.retryAfterSeconds ?? 60)
    return NextResponse.json(
      { error: "Too many requests. Please try again in a moment." },
      { status: 429, headers: { "retry-after": String(retryAfterSeconds) } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const licenseKey =
    body && typeof body === "object" && "licenseKey" in body
      ? String((body as { licenseKey?: unknown }).licenseKey ?? "")
      : ""

  const res = await redeemUnlockSession(licenseKey)
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: res.status ?? 400 })
  }

  return NextResponse.json({ ok: true, expiresAt: res.expiresAtIso })
}

