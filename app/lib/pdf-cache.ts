import crypto from "node:crypto"
import { Redis } from "@upstash/redis"

const memory = new Map<string, { bytes: Uint8Array; expiresAtMs: number }>()

function randomId(): string {
  return crypto
    .randomBytes(24)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  return new Redis({ url, token })
}

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64")
}

function base64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"))
}

const KEY_PREFIX = "pdf:"
const DEFAULT_TTL_SECONDS = 10 * 60

export async function putPdfBytesOnce(
  bytes: Uint8Array,
  opts?: { ttlSeconds?: number }
): Promise<string> {
  const id = randomId()
  const ttl = opts?.ttlSeconds ?? DEFAULT_TTL_SECONDS
  const redis = getRedis()
  if (redis) {
    await redis.set(`${KEY_PREFIX}${id}`, bytesToBase64(bytes), { ex: ttl })
    return id
  }
  memory.set(id, { bytes, expiresAtMs: Date.now() + ttl * 1000 })
  return id
}

export async function getPdfBytesOnce(id: string): Promise<Uint8Array | null> {
  const redis = getRedis()
  if (redis) {
    const key = `${KEY_PREFIX}${id}`
    const b64 = (await redis.get<string>(key)) ?? null
    if (!b64) return null
    // Best-effort single download.
    await redis.del(key)
    return base64ToBytes(b64)
  }

  const item = memory.get(id)
  if (!item) return null
  if (item.expiresAtMs <= Date.now()) {
    memory.delete(id)
    return null
  }
  memory.delete(id)
  return item.bytes
}

