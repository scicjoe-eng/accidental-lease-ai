"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NAV_ITEMS } from "@/components/dashboard/nav-items"
import { cn } from "@/lib/utils"

function navItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardSidebarNav() {
  const pathname = usePathname() ?? ""

  return (
    <nav className="flex flex-col gap-0.5 px-3" aria-label="Sidebar">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = navItemActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <Icon className="size-4 opacity-80" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardMobileNav() {
  const pathname = usePathname() ?? ""

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-2 lg:hidden"
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ href, label }) => {
        const active = navItemActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border/80 bg-card/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
