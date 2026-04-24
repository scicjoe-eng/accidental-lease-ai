import type { Metadata } from "next"

import { UpgradePageClient } from "@/app/upgrade/upgrade-client"

export const metadata: Metadata = {
  title: "Upgrade to Pro | AcciLease AI",
  description:
    "AcciLease Pro on Gumroad — redeem your license key for an unlock session in this browser.",
}

export default async function UpgradePage() {
  return (
    <div className="min-h-dvh bg-background px-4 py-16 text-foreground">
      <UpgradePageClient />
    </div>
  )
}
