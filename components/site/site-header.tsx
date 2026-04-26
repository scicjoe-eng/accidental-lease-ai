"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Sparkles, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CORE_NAV = [
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/guides", label: "Guides" },
  { href: "/accidental-landlord-guide", label: "Guide" },
  { href: "/landlord-tenant-laws", label: "Laws" },
  { href: "/legal", label: "Legal" },
] as const

function isAppShellRoute(pathname: string) {
  // Pages that already render their own authenticated shell/navigation.
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  )
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/"
  const hidden = isAppShellRoute(pathname)

  const [mobileOpen, setMobileOpen] = useState(false)

  const activeHref = useMemo(() => {
    for (const item of CORE_NAV) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item.href
      }
    }
    return null
  }, [pathname])

  if (hidden) return null

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <span>AcciLease AI</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {CORE_NAV.map((item) => {
              const active = activeHref === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/upgrade?redirectTo=/audit#redeem" />}
          >
            Upgrade
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X aria-hidden className="size-4" /> : <Menu aria-hidden className="size-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border/60 bg-background/95 md:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-3 sm:px-6">
            {CORE_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

