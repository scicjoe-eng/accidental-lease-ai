/** @jest-environment node */
import { POST } from "@/app/api/unlock/redeem/route"

jest.mock("@/app/lib/rate-limit", () => ({
  assertRateLimit: jest.fn(async () => undefined),
}))

jest.mock("@/app/lib/unlock", () => ({
  redeemUnlockSession: jest.fn(async (key: string) => {
    if (!key.trim()) return { ok: false, error: "Please enter License Key.", status: 400 }
    if (key === "USED") return { ok: false, error: "This key has already been used.", status: 409 }
    return { ok: true, expiresAtIso: "2026-01-01T00:00:00.000Z" }
  }),
}))

describe("/api/unlock/redeem", () => {
  it("returns 400 on invalid JSON", async () => {
    const req = new Request("http://localhost/api/unlock/redeem", {
      method: "POST",
      body: "{",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns ok true on success", async () => {
    const req = new Request("http://localhost/api/unlock/redeem", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ licenseKey: "OK" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.expiresAt).toBeTruthy()
  })
})

