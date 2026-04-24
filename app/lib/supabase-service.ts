/**
 * Service-role Supabase client for **trusted server-only** jobs (RAG reads, batch imports).
 * Never import from Client Components.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export function createServiceRoleSupabase(): SupabaseClient {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL
  )?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    const missing: string[] = []
    if (!url) {
      missing.push("NEXT_PUBLIC_SUPABASE_URL (or server-only SUPABASE_URL)")
    }
    if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY")
    throw new Error(
      `Missing ${missing.join(" and ")}. Add them to .env.local (see Supabase Project Settings → API).`
    )
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
