import type { Metadata } from "next"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

import { GenerateLeaseForm } from "./generate-form"

export const metadata: Metadata = {
  title: "Generate lease | AcciLease AI",
  description:
    "Draft a state-specific residential lease for accidental landlords using AcciLease legal data — stream preview and download a watermarked PDF.",
}

export default function GeneratePage() {
  return (
    <DashboardShell>
      <GenerateLeaseForm />
    </DashboardShell>
  )
}
