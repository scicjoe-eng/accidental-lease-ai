import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { AuditLeaseClient } from "@/app/audit/audit-client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { createClient } from "@/app/lib/supabase"

export const metadata: Metadata = {
  title: "Audit lease PDF | AcciLease AI",
  description:
    "Upload an existing residential lease PDF for an AI-assisted risk scan and downloadable report.",
}

export default async function AuditPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/audit")
  }

  return (
    <DashboardShell>
      <AuditLeaseClient />
    </DashboardShell>
  )
}
