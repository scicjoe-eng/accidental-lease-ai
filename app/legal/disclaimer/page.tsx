import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Disclaimer | AcciLease AI",
  description: "Important disclaimers and limitations for AcciLease AI outputs.",
  alternates: { canonical: "https://accidental-lease-ai.com/legal/disclaimer" },
}

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Disclaimer</h1>
        <p>
          AcciLease AI is an informational tool. Outputs may be incomplete, incorrect, or not suitable for your specific
          jurisdiction or facts.
        </p>

        <h2>No attorney-client relationship</h2>
        <p>
          Using this site does not create an attorney-client relationship. If you need legal advice, consult a licensed
          attorney in your jurisdiction.
        </p>

        <h2>Verify before use</h2>
        <p>
          Always review and verify any generated lease clauses, notices, or summaries. Make sure they match local laws and
          your situation before relying on them.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, AcciLease AI and its contributors are not liable for any damages arising
          from the use of the site or its outputs.
        </p>
      </div>
    </div>
  )
}

