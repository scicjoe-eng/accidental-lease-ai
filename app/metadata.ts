import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AcciLease AI - AI-Powered Lease Drafting and Contract Review for Accidental Landlords",
  description:
    "AcciLease AI provides AI-assisted lease drafting and contract review services for accidental landlords, ensuring compliance with state-specific laws across all 50 states and DC.",
  keywords: [
    "accidental landlord",
    "lease drafting",
    "contract review",
    "AI lease generator",
    "landlord tenant laws",
    "rental agreement",
    "lease analyzer"
  ],
  alternates: {
    canonical: "https://accidental-lease-ai.com",
  },
  openGraph: {
    title: "AcciLease AI - AI-Powered Lease Drafting and Contract Review",
    description: "AcciLease AI provides AI-assisted lease drafting and contract review services for accidental landlords, ensuring compliance with state-specific laws across all 50 states and DC.",
    url: "https://accidental-lease-ai.com",
    type: "website",
    images: [
      {
        url: "https://accidental-lease-ai.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "AcciLease AI - AI-Powered Lease Drafting and Contract Review"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AcciLease AI - AI-Powered Lease Drafting and Contract Review",
    description: "AcciLease AI provides AI-assisted lease drafting and contract review services for accidental landlords, ensuring compliance with state-specific laws across all 50 states and DC.",
    images: ["https://accidental-lease-ai.com/og-image.png"]
  }
}
