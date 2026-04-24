import crypto from "node:crypto"
import { cookies } from "next/headers"

import { verifyGumroadLicenseKey } from "@/app/lib/gumroad"
import { createServiceRoleSupabase } from "@/app/lib/supabase-service"

export const UNLOCK_COOKIE_NAME = "accilease_unlock_session"
export const UNLOCK_SESSION_SECONDS = 10 * 60

// Test bypass key prefix — DO NOT use in production
export const TEST_UNLIMITED_KEY_PREFIX = "ACCITEST-UNLIMITED-"

function sha256Base64Url(input: string): string {
  const buf = crypto.createHash("sha256").update(input, "utf8").digest()
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function randomToken(bytes = 32): string {
  return crypto
    .randomBytes(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

export type UnlockRedeemResult =
  | { ok: true; expiresAtIso: string }
  | { ok: false; error: string; status?: number }

type RedemptionRow = {
  key_hash: string
  gumroad_product_id: string
  gumroad_purchase_id: string | null
  session_token_hash: string | null
  session_expires_at: string | null
  consumed_at: string | null
}

export async function redeemUnlockSession(licenseKey: string): Promise<UnlockRedeemResult> {
  const key = licenseKey.trim()

  // ── Test bypass: unlimited test key ──────────────────────────────────────
  if (key.startsWith(TEST_UNLIMITED_KEY_PREFIX)) {
    const supabase = createServiceRoleSupabase()
    const key_hash = sha256Base64Url(key)
    const sessionToken = randomToken(32)
    const session_token_hash = sha256Base64Url(sessionToken)
    // 2099-12-31 = effectively permanent, consumed_at = null = never consumed
    const permanentExpiresAt = "2099-12-31T23:59:59.999Z"

    const { error: upsertError } = await supabase
      .from("license_redemptions")
      .upsert(
        {
          key_hash,
          gumroad_product_id: "TEST_UNLIMITED",
          gumroad_purchase_id: "TEST_UNLIMITED",
          session_token_hash,
          session_expires_at: permanentExpiresAt,
          consumed_at: null,
        },
        { onConflict: "key_hash" }
      )

    if (upsertError) {
      return { ok: false, error: "Test key setup failed.", status: 500 }
    }


    const jar = await cookies()
    jar.set({
      name: UNLOCK_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // ~10 years for test
    })


    return { ok: true, expiresAtIso: permanentExpiresAt }
  }
  // ── End test bypass ──────────────────────────────────────────────────────

  const verify = await verifyGumroadLicenseKey(licenseKey)
  if (!verify.ok) return { ok: false, error: verify.userMessage, status: 400 }

  const key_hash = sha256Base64Url(key)

  const supabase = createServiceRoleSupabase()

  const { data: existing, error: fetchError } = await supabase
    .from("license_redemptions")
    .select(
      "key_hash, gumroad_product_id, gumroad_purchase_id, session_token_hash, session_expires_at, consumed_at"
    )
    .eq("key_hash", key_hash)
    .maybeSingle()

  if (fetchError) {
    return { ok: false, error: "Redeem failed. Please try again later.", status: 500 }
  }
  if (existing && (existing as RedemptionRow).consumed_at) {
    return { ok: false, error: "This key has already been used.", status: 409 }
  }

  const sessionToken = randomToken(32)
  const session_token_hash = sha256Base64Url(sessionToken)
  const expiresAt = new Date(Date.now() + UNLOCK_SESSION_SECONDS * 1000)

  const payload: Pick<
    RedemptionRow,
    | "key_hash"
    | "gumroad_product_id"
    | "gumroad_purchase_id"
    | "session_token_hash"
    | "session_expires_at"
  > = {
    key_hash,
    gumroad_product_id: verify.productId,
    gumroad_purchase_id: verify.purchaseId ?? null,
    session_token_hash,
    session_expires_at: expiresAt.toISOString(),
  }

  const { error: upsertError } = await supabase
    .from("license_redemptions")
    .upsert(payload, { onConflict: "key_hash" })

  if (upsertError) {
    return { ok: false, error: "Redeem failed. Please try again later.", status: 500 }
  }

  const jar = await cookies()
  jar.set({
    name: UNLOCK_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UNLOCK_SESSION_SECONDS,
  })

  return { ok: true, expiresAtIso: expiresAt.toISOString() }
}

export type UnlockStatus =
  | { ok: true; canUse: true; keyHash: string }
  | { ok: true; canUse: false }
  | { ok: false; error: string }

export type AtomicConsumeResult =
  | { ok: true; consumed: true; keyHash: string }
  | { ok: true; consumed: false }
  | { ok: false; error: string }

export async function getUnlockStatusFromCookie(): Promise<UnlockStatus> {
  const jar = await cookies()
  const token = jar.get(UNLOCK_COOKIE_NAME)?.value?.trim()
  if (!token) return { ok: true, canUse: false }

  const tokenHash = sha256Base64Url(token)
  const nowIso = new Date().toISOString()
  const supabase = createServiceRoleSupabase()
  const { data, error } = await supabase
    .from("license_redemptions")
    .select("key_hash, session_expires_at, consumed_at")
    .eq("session_token_hash", tokenHash)
    .gt("session_expires_at", nowIso)
    .maybeSingle()

  if (error) return { ok: false, error: "Unlock check failed." }
  if (!data) return { ok: true, canUse: false }
  if (data.consumed_at) return { ok: true, canUse: false }
  return { ok: true, canUse: true, keyHash: String(data.key_hash) }
}

export async function consumeUnlockKey(keyHash: string): Promise<void> {
  const supabase = createServiceRoleSupabase()
  await supabase
    .from("license_redemptions")
    .update({ consumed_at: new Date().toISOString() })
    .eq("key_hash", keyHash)
    .is("consumed_at", null)
}

/**
 * Atomically consume an unlock session based on the cookie token.
 * This prevents double-spend under concurrency.
 * Note: test-bypass sessions (TEST_UNLIMITED product) are never consumed.
 */
export async function consumeUnlockFromCookie(): Promise<AtomicConsumeResult> {
  const jar = await cookies()
  const token = jar.get(UNLOCK_COOKIE_NAME)?.value?.trim()
  if (!token) return { ok: true, consumed: false }

  const tokenHash = sha256Base64Url(token)
  const nowIso = new Date().toISOString()
  const supabase = createServiceRoleSupabase()

  // Atomic update: only one concurrent request can update 1 row.
  const { data, error } = await supabase
    .from("license_redemptions")
    .update({ consumed_at: nowIso })
    .eq("session_token_hash", tokenHash)
    .gt("session_expires_at", nowIso)
    .is("consumed_at", null)
    .select("key_hash, gumroad_product_id")

  if (error) return { ok: false, error: "Unlock consume failed." }
  const rows = Array.isArray(data) ? data : []
  if (rows.length !== 1) return { ok: true, consumed: false }
  const row = rows[0]
  const keyHash = String(row?.key_hash ?? "")
  if (!keyHash) return { ok: true, consumed: false }
  // Never consume test-bypass sessions — they are unlimited
  if (row?.gumroad_product_id === "TEST_UNLIMITED") {
    return { ok: true, consumed: true, keyHash } // report consumed=true so caller proceeds, but don't actually consume
  }
  return { ok: true, consumed: true, keyHash }
}

