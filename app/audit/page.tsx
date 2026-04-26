import type { Metadata } from "next"

import { AuditLeaseClient } from "@/app/audit/audit-client"

export const metadata: Metadata = {
  title: "Audit lease PDF | AcciLease AI",
  description:
    "Upload an existing residential lease PDF for an AI-assisted risk scan and downloadable report.",
}

export default async function AuditPage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6">
      <AuditLeaseClient />
    </div>
  )
}
