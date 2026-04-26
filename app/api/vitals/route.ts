import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  // RUM web-vitals beacons: store in platform logs.
  // In Vercel, these appear in Function Logs and can be exported to Log Drains.
  try {
    const metric = await req.json()
    console.log("[web-vitals]", metric)
  } catch {
    // ignore malformed beacons
  }
  return NextResponse.json({ ok: true })
}

