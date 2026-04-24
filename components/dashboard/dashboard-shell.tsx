import Link from "next/link"
import { Sparkles } from "lucide-react"

import {
  DashboardMobileNav,
  DashboardSidebarNav,
} from "@/components/dashboard/dashboard-nav"
import { UserMenu } from "@/components/dashboard/user-menu"
import { Button } from "@/components/ui/button"
import { createClient } from "@/app/lib/supabase"

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email
  const cleaned = local.replace(/[^a-zA-Z0-9]/g, "")
  if (cleaned.length >= 2) return cleaned.slice(0, 2).toUpperCase()
  if (email.length >= 2) return email.slice(0, 2).toUpperCase()
  return "?"
}

export async function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ?? null
  const email = user?.email ?? ""
  const initials = user ? initialsFromEmail(email) : ""

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <span>AcciLease AI</span>
          </Link>
          {user ? (
            <UserMenu email={email} avatarUrl={avatarUrl} initials={initials} />
          ) : (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              登录
            </Button>
          )}
        </div>
        <DashboardMobileNav />
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-1 gap-0 lg:gap-8">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 flex-col border-r border-border/60 py-6 lg:flex xl:w-64">
          <DashboardSidebarNav />
          <div className="hidden" aria-hidden />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
