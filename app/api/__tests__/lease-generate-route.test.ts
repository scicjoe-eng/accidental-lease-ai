/** @jest-environment node */
import { POST } from "@/app/api/lease/generate/route"

jest.mock("@/app/lib/rate-limit", () => ({
  assertRateLimit: jest.fn(async () => undefined),
}))

jest.mock("@/app/lib/rag", () => ({
  getStateLawAppendixForJurisdiction: jest.fn(async () => "RAG"),
}))

jest.mock("@/app/lib/lease-pdf", () => ({
  buildWatermarkedLeasePdf: jest.fn(async () => new Uint8Array([1, 2, 3])),
}))

jest.mock("@/app/lib/unlock", () => ({
  getUnlockStatusFromCookie: jest.fn(async () => ({ ok: true, canUse: true, keyHash: "kh" })),
  consumeUnlockFromCookie: jest.fn(async () => ({ ok: true, consumed: true, keyHash: "kh" })),
}))

jest.mock("@/app/lib/ai", () => {
  const z = require("zod")
  return {
    leaseFormInputSchema: z.object({
      jurisdiction_state: z.string(),
    }),
    normalizeLeaseFormInput: (x: unknown) => x as Parameters<typeof import("@/app/lib/ai").normalizeLeaseFormInput>[0],
    getSignReadyMissingFields: () => [],
    generateLeaseContract: jest.fn(async () => ({
      ok: true,
      contract: {
        disclaimer_banner: "",
        title: "T",
        parties: { landlord: "L", tenant: "T", premises_address: "A" },
        term: { start_date: "2026-01-01", is_month_to_month: true },
        rent: { amount: "$1" },
        deposit: { amount: "$0" },
        clauses: [{ title: "C1", text: "X" }],
        governing_law: { state: "CA", state_highlights: [] },
      },
    })),
    formatLlmErrorForUser: (e: any) => String(e?.message ?? e),
  }
})

describe("/api/lease/generate", () => {
  it("returns locked=false with pdfBase64 on unlocked sign-ready", async () => {
    const req = new Request("http://localhost/api/lease/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jurisdiction_state: "CA" }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.locked).toBe(false)
    expect(json.pdfId).toBeTruthy()
  })
})

