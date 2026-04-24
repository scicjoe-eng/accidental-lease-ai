import { headers } from "next/headers"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type RateLimitConfig = {
  bucket: string
  limit: number
  windowSeconds: number
}

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number }

const memoryBuckets = new Map<string, { resetAtMs: number; count: number }>()

async function getIpAndUaKey(): Promise<string> {
  const h = await headers()
  const xff = h.get("x-forwarded-for") || ""
  const ip = xff.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  const ua = h.get("user-agent") || "unknown"
  return `${ip}|${ua}`
}

function getUpstashRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null

  const redis = new Redis({ url, token })
  // Create a base instance; limiter is set per-call in `checkUpstashRateLimit`.
  return new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(1, "1 s") })
}

async function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  const existing = memoryBuckets.get(key)
  if (!existing || existing.resetAtMs <= now) {
    memoryBuckets.set(key, { resetAtMs: now + config.windowSeconds * 1000, count: 1 })
    return { ok: true }
  }
  if (existing.count >= config.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAtMs - now) / 1000)
    )
    return { ok: false, retryAfterSeconds }
  }
  existing.count += 1
  return { ok: true }
}

async function checkUpstashRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const rl = getUpstashRatelimit()
  if (!rl) {
    return checkMemoryRateLimit(key, config)
  }

  // Recreate limiter for requested window.
  ;(rl as unknown as { limiter: unknown }).limiter = Ratelimit.fixedWindow(
    config.limit,
    `${config.windowSeconds} s`
  )
  const res = await rl.limit(`${config.bucket}|${key}`)
  const success = Boolean((res as { success?: unknown }).success)
  const reset = Number(
    (res as { reset?: unknown }).reset ?? Date.now() + config.windowSeconds * 1000
  )
  if (success) return { ok: true }
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  return { ok: false, retryAfterSeconds }
}

export async function assertRateLimit(config: RateLimitConfig): Promise<void> {
  const identity = await getIpAndUaKey()
  const key = identity
  const res = await checkUpstashRateLimit(key, config)
  if (!res.ok) {
    const err = new Error("rate_limited") as Error & { retryAfterSeconds: number }
    err.retryAfterSeconds = res.retryAfterSeconds
    throw err
  }
}

