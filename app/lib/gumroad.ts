/**
 * Gumroad License API verify (server-only).
 * @see https://gumroad.com/api#licenses
 *
 * All `userMessage` strings are end-user Chinese for UI.
 */

export type GumroadVerifyResult =
  | { ok: true; productId: string; purchaseId?: string }
  | { ok: false; userMessage: string }

const ZH = {
  config:
    "当前无法验证 License（服务未就绪）。请稍后再试或联系支持。",
  empty: "请输入 License Key。",
  network: "网络连接异常，请检查网络后重试。",
  /** Gumroad `success: false` — wrong/fake key, refunded, etc. */
  licenseInvalidOrProduct:
    "License Key 无效或不属于此产品，请检查后重试。",
  licenseInvalidOrExpired:
    "License Key 无效或已过期，请确认购买后复制正确的 Key。",
  badResponse: "激活失败，请稍后重试或联系支持。",
  httpError: "激活失败，请稍后重试或联系支持。",
} as const

type GumroadApiResponse = {
  success?: boolean
  message?: string
  purchase?: { id?: string; product_id?: string; product_name?: string }
}

function mapGumroadFailureMessage(apiMessage: string | undefined): string {
  const m = (apiMessage ?? "").toLowerCase()
  if (
    m.includes("refund") ||
    m.includes("revoked") ||
    m.includes("disabled") ||
    m.includes("cancelled") ||
    m.includes("canceled") ||
    m.includes("expired") ||
    m.includes("expire")
  ) {
    return ZH.licenseInvalidOrExpired
  }
  if (
    m.includes("product") ||
    m.includes("doesn't exist") ||
    m.includes("does not exist") ||
    m.includes("not found") ||
    m.includes("wrong")
  ) {
    return ZH.licenseInvalidOrProduct
  }
  return ZH.licenseInvalidOrProduct
}

/**
 * Verify a license key against your product. Requires env:
 * - `GUMROAD_ACCESS_TOKEN`
 * - `GUMROAD_PRODUCT_ID`
 */
export async function verifyGumroadLicenseKey(
  licenseKey: string
): Promise<GumroadVerifyResult> {
  const token = process.env.GUMROAD_ACCESS_TOKEN?.trim()
  const productId = process.env.GUMROAD_PRODUCT_ID?.trim()
  if (!token || !productId) {
    return { ok: false, userMessage: ZH.config }
  }

  const key = licenseKey.trim()
  if (!key) {
    return { ok: false, userMessage: ZH.empty }
  }

  const body = new URLSearchParams({
    product_id: productId,
    license_key: key,
    access_token: token,
  })

  let res: Response
  try {
    res = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
  } catch (cause) {
    console.warn("[gumroad] verify fetch failed:", cause)
    return { ok: false, userMessage: ZH.network }
  }

  let json: GumroadApiResponse
  try {
    json = (await res.json()) as GumroadApiResponse
  } catch {
    console.warn("[gumroad] verify JSON parse failed, status:", res.status)
    return { ok: false, userMessage: ZH.badResponse }
  }

  if (!res.ok) {
    console.warn("[gumroad] verify HTTP", res.status, json?.message)
    return { ok: false, userMessage: ZH.httpError }
  }

  if (json.success === false) {
    const friendly = mapGumroadFailureMessage(json.message)
    console.warn("[gumroad] verify success=false:", json.message ?? "(no message)")
    return { ok: false, userMessage: friendly }
  }

  if (!json.success) {
    return { ok: false, userMessage: ZH.licenseInvalidOrProduct }
  }

  const returnedProductId = json.purchase?.product_id
  if (returnedProductId && returnedProductId !== productId) {
    return { ok: false, userMessage: ZH.licenseInvalidOrProduct }
  }

  return {
    ok: true,
    productId,
    purchaseId: json.purchase?.id,
  }
}

/** Gumroad checkout for AcciLease Pro (one-time; unlock via license redeem). */
export const GUMROAD_PRO_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_GUMROAD_CHECKOUT_URL ||
  "https://8760505533632.gumroad.com/l/ipvqkqd"
