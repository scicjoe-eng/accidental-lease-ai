import { redeemUnlockSession, consumeUnlockFromCookie } from "@/app/lib/unlock"

jest.mock("next/headers", () => {
  return {
    cookies: jest.fn(async () => ({
      get: jest.fn(() => ({ value: "tok" })),
      set: jest.fn(),
    })),
    headers: jest.fn(() => ({
      get: jest.fn(() => null),
    })),
  }
})

jest.mock("@/app/lib/gumroad", () => ({
  verifyGumroadLicenseKey: jest.fn(async () => ({
    ok: true,
    productId: "prod",
    purchaseId: "purch",
  })),
}))

const maybeSingle = jest.fn()
const upsert = jest.fn()
const update = jest.fn()
const peekMaybeSingle = jest.fn()

jest.mock("@/app/lib/supabase-service", () => ({
  createServiceRoleSupabase: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gt: jest.fn(() => ({
            is: jest.fn(() => ({
              maybeSingle: peekMaybeSingle,
            })),
          })),
          maybeSingle,
        })),
      })),
      upsert,
      update,
    })),
  })),
}))

describe("unlock", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("redeemUnlockSession: returns ok and sets cookie", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    upsert.mockResolvedValueOnce({ error: null })

    const res = await redeemUnlockSession("KEY")
    expect(res.ok).toBe(true)
  })

  it("consumeUnlockFromCookie: returns consumed=false when update affects 0 rows", async () => {
    peekMaybeSingle.mockResolvedValueOnce({
      data: { key_hash: "kh", gumroad_product_id: "prod" },
      error: null,
    })
    update.mockReturnValueOnce({
      eq: () => ({
        gt: () => ({
          is: () => ({
            select: async () => ({ data: [], error: null }),
          }),
        }),
      }),
    })

    const res = await consumeUnlockFromCookie()
    expect(res.ok).toBe(true)
    expect(res.consumed).toBe(false)
  })

  it("consumeUnlockFromCookie: returns consumed=true when update returns 1 row", async () => {
    peekMaybeSingle.mockResolvedValueOnce({
      data: { key_hash: "kh", gumroad_product_id: "prod" },
      error: null,
    })
    update.mockReturnValueOnce({
      eq: () => ({
        gt: () => ({
          is: () => ({
            select: async () => ({ data: [{ key_hash: "kh" }], error: null }),
          }),
        }),
      }),
    })

    const res = await consumeUnlockFromCookie()
    expect(res.ok).toBe(true)
    expect(res.consumed).toBe(true)
    if (res.ok && res.consumed) {
      expect(res.keyHash).toBe("kh")
    }
  })
})

