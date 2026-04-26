import { NextResponse, type NextRequest } from "next/server"

/**
 * App proxy hook (Next.js 16 `proxy` convention).
 * This product intentionally does NOT require sign-in.
 */
export async function proxy(request: NextRequest) {
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    // Exclude service worker + workbox assets (no session refresh needed)
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|workbox-.*\\.js|fallback-.*\\.js|swe-worker-.*\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
