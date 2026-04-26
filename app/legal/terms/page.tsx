import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms | AcciLease AI",
  description: "Terms of use for AcciLease AI.",
  alternates: { canonical: "https://accidental-lease-ai.com/legal/terms" },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Terms</h1>
        <p>
          These terms are provided for general informational purposes and may be updated over time. By using AcciLease AI,
          you agree to use the product responsibly and in compliance with applicable laws.
        </p>

        <h2>1. No legal advice</h2>
        <p>
          AcciLease AI provides educational information and drafting assistance. It is not a law firm and does not provide
          legal advice. If you need legal advice for your jurisdiction, consult a qualified attorney.
        </p>

        <h2>2. User responsibility</h2>
        <p>
          You are responsible for reviewing and validating any output before using it in a real-world legal context. Laws
          vary by jurisdiction and change over time.
        </p>

        <h2>3. Availability</h2>
        <p>
          We aim to keep the service available, but we do not guarantee uninterrupted access. Features may change or be
          discontinued.
        </p>

        <h2>4. Intellectual property</h2>
        <p>
          The product, branding, and site content are protected by applicable intellectual property laws. You may not copy
          or resell the service without permission.
        </p>
      </div>
    </div>
  )
}

