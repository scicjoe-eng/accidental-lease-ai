import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Supabase session refresh + auth gating (Next.js 16 `proxy` convention; replaces `middleware`).
 * `@supabase/ssr`: `createServerClient` with cookie `getAll` / `setAll`.
 */
function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    return null
  }
  return { url, anonKey }
}

function applyRefreshedSessionCookies(
  sessionResponse: NextResponse,
  target: NextResponse
): void {
  for (const cookie of sessionResponse.cookies.getAll()) {
    target.cookies.set(cookie.name, cookie.value)
  }
}

/** Add public API paths here (exact or use `startsWith` below). */
const PUBLIC_API_PREFIXES: string[] = [
  // e.g. "/api/webhooks/stripe",
]

function isPublicApi(pathname: string): boolean {
  if (!pathname.startsWith("/api/")) return false
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true
  }
  return false
}

function requiresAuthentication(pathname: string): boolean {
  if (pathname === "/upgrade" || pathname.startsWith("/upgrade/")) return false
  if (pathname.startsWith("/dashboard")) return true
  if (pathname === "/generate" || pathname.startsWith("/generate/")) return true
  if (pathname === "/audit" || pathname.startsWith("/audit/")) return true
  if (pathname.startsWith("/api/") && !isPublicApi(pathname)) return true
  return false
}

function isAuthPage(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/")
  )
}

function loginRedirectUrl(request: NextRequest, returnPath: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = "/login"
  url.search = ""
  url.searchParams.set("redirectTo", returnPath)
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const env = getSupabaseEnv()
  if (!env) {
    return new NextResponse("Server configuration error", { status: 503 })
  }
  const { url, anonKey } = env

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headersToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
        for (const [key, value] of Object.entries(headersToSet)) {
          response.headers.set(key, value)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const returnPath = `${pathname}${request.nextUrl.search}`

  if (user && isAuthPage(pathname)) {
    const target = request.nextUrl.clone()
    target.pathname = "/dashboard"
    target.search = ""
    const redirectResponse = NextResponse.redirect(target)
    applyRefreshedSessionCookies(response, redirectResponse)
    return redirectResponse
  }

  if (!user && requiresAuthentication(pathname)) {
    if (pathname.startsWith("/api/")) {
      const apiRes = NextResponse.json(
        { error: "Unauthorized", message: "Sign in required." },
        { status: 401 }
      )
      applyRefreshedSessionCookies(response, apiRes)
      return apiRes
    }
    const redirectResponse = loginRedirectUrl(request, returnPath)
    applyRefreshedSessionCookies(response, redirectResponse)
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    // Exclude service worker + workbox assets (no session refresh needed)
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|workbox-.*\\.js|fallback-.*\\.js|swe-worker-.*\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
