"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">{q}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{a}</CardContent>
    </Card>
  )
}

export function LandingFaq() {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        Questions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FaqItem
          q="What does the audit check?"
          a="Deposits, entry, repairs, fees, eviction notice patterns, and other common risk areas."
        />
        <FaqItem
          q="What is a locked preview?"
          a="You’ll see a small preview first. Unlock to view everything and download once."
        />
        <FaqItem
          q="Does this support DOCX?"
          a="Yes — PDF and DOCX are supported."
        />
        <FaqItem
          q="Is this state-aware?"
          a="Yes — drafts and highlights adapt to the state you choose."
        />
      </div>
    </section>
  )
}

