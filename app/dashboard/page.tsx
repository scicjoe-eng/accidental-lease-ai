import Link from "next/link"
import { FileSearch, PlusCircle } from "lucide-react"

import { createClient } from "@/app/lib/supabase"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const MOCK_ACTIVITY = [
  { title: "Duplex — month-to-month addendum", status: "Draft", date: "Apr 18" },
  { title: "SFH lease — Section 8 rider", status: "Review", date: "Apr 12" },
  { title: "ADU rental agreement", status: "Audited", date: "Apr 2" },
] as const

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email
  const cleaned = local.replace(/[^a-zA-Z0-9]/g, "")
  if (cleaned.length >= 2) return cleaned.slice(0, 2).toUpperCase()
  if (email.length >= 2) return email.slice(0, 2).toUpperCase()
  return "?"
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email ?? ""
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ?? null
  const initials = user ? initialsFromEmail(email) : ""

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-8">
        {!user ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="font-heading text-xl">
                Please login first
              </CardTitle>
              <CardDescription>
                Login to view dashboard, generate leases, and audit contracts.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button nativeButton={false} render={<Link href="/login" />}>
                Go to login
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/login?mode=signup" />}
              >
                Create account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <AvatarInHeader
                avatarUrl={avatarUrl}
                initials={initials}
                label={email}
              />
              <div className="space-y-1">
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  Hi, {email}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Draft stronger leases, audit PDFs for risky clauses, and keep
                  a clear history — built for landlords who did not plan on
                  being landlords.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Quick actions</CardTitle>
                <CardDescription>
                  Start a new lease package or run an audit on an existing
                  contract.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  size="lg"
                  className="h-12 w-full min-w-[200px] gap-2 sm:w-auto sm:min-w-[240px]"
                  nativeButton={false}
                  render={<Link href="/generate" />}
                >
                  <PlusCircle className="size-5" aria-hidden />
                  Generate New Lease
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full gap-2 sm:w-auto"
                  nativeButton={false}
                  render={<Link href="/audit" />}
                >
                  <FileSearch className="size-5" aria-hidden />
                  Audit Existing Contract
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4 border-t sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Recent activity (demo)
                  </p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {MOCK_ACTIVITY.map((row) => (
                      <li
                        key={row.title}
                        className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/50 py-2 last:border-0"
                      >
                        <span className="font-medium">{row.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {row.status} · {row.date}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardFooter>
            </Card>
          </>
        )}

        <p className="hidden" aria-hidden />
      </div>
    </DashboardShell>
  )
}

/** Larger avatar next to welcome line (header keeps compact menu avatar). */
function AvatarInHeader({
  avatarUrl,
  initials,
  label,
}: {
  avatarUrl: string | null
  initials: string
  label: string
}) {
  return (
    <Avatar
      size="lg"
      className="size-16 shrink-0 border border-border/80 shadow-sm"
    >
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={label} /> : null}
      <AvatarFallback className="text-lg font-medium">{initials}</AvatarFallback>
    </Avatar>
  )
}
