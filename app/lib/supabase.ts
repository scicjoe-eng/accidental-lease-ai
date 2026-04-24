import {
  createBrowserClient as createSupabaseBrowserClient,
  createServerClient,
} from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

function requireSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return { url, anonKey }
}

/**
 * Supabase client for **Server Components**, Route Handlers, and Server Actions.
 * Binds to the current request cookie store via `cookies()` from `next/headers`.
 *
 * `setAll` is wrapped in try/catch because cookies cannot always be written from a Server Component (e.g. during static prerender). Use middleware session refresh when writes are required.
 */
export async function createClient<
  Database = unknown,
  SchemaName extends string & keyof Omit<Database, '__InternalSupabase'> = 'public' extends keyof Omit<
    Database,
    '__InternalSupabase'
  >
    ? 'public'
    : string & keyof Omit<Database, '__InternalSupabase'>,
>(): Promise<SupabaseClient<Database, SchemaName>> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const { url, anonKey } = requireSupabaseEnv()

  return createServerClient<Database, SchemaName>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          /* ignore: read-only cookie store in this server context */
        }
      },
    },
  })
}

/**
 * Supabase client for **Client Components**. Uses `@supabase/ssr` browser cookie helpers (`getAll` / `setAll` internally).
 *
 * Only call from the browser. For server rendering, use {@link createClient}.
 */
export function createBrowserClient<
  Database = unknown,
  SchemaName extends string & keyof Omit<Database, '__InternalSupabase'> = 'public' extends keyof Omit<
    Database,
    '__InternalSupabase'
  >
    ? 'public'
    : string & keyof Omit<Database, '__InternalSupabase'>,
>(): SupabaseClient<Database, SchemaName> {
  const { url, anonKey } = requireSupabaseEnv()
  return createSupabaseBrowserClient<Database, SchemaName>(url, anonKey)
}

/** Alias for client-side auth pages (same as {@link createBrowserClient}). */
export const createBrowserClientSupabase = createBrowserClient
