import type { Metadata } from "next"

import { GenerateLeaseForm } from "./generate-form"

export const metadata: Metadata = {
  title: "Generate lease | AcciLease AI",
  description:
    "Draft a state-specific residential lease for accidental landlords using AcciLease legal data — stream preview and download a watermarked PDF.",
}

export default function GeneratePage() {
  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6">
      <GenerateLeaseForm />
    </div>
  )
}
