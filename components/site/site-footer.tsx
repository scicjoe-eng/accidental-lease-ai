"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function isAppShellRoute(pathname: string) {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/audit" ||
    pathname.startsWith("/audit/") ||
    pathname === "/generate" ||
    pathname.startsWith("/generate/") ||
    pathname === "/upgrade" ||
    pathname.startsWith("/upgrade/")
  )
}

export function SiteFooter() {
  const pathname = usePathname() ?? "/"
  if (isAppShellRoute(pathname)) return null

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden" aria-hidden />
          <nav className="flex items-center gap-4" aria-label="Footer">
            <Link className="hover:text-foreground" href="/about">
              About
            </Link>
            <Link className="hover:text-foreground" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-foreground" href="/sitemap.xml">
              Sitemap
            </Link>
          </nav>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground/90">
          Built for accidental landlords: generate leases, audit existing agreements, and learn the rules that vary by state.
        </p>
      </div>
    </footer>
  )
}

