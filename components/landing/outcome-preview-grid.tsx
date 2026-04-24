"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function ExampleLine({
  label,
  tone,
}: {
  label: string
  tone: "high" | "medium" | "low"
}) {
  const variant =
    tone === "high" ? "destructive" : tone === "medium" ? "secondary" : "outline"
  const text =
    tone === "high" ? "High" : tone === "medium" ? "Medium" : "Low"
  return (
    <div className="flex items-start gap-2 text-sm">
      <Badge variant={variant} className="mt-0.5">
        {text}
      </Badge>
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

export function OutcomePreviewGrid() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">
            What looks risky
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ExampleLine tone="high" label="Entry rights are too broad" />
          <ExampleLine
            tone="medium"
            label="Deposit return steps are unclear"
          />
          <ExampleLine tone="low" label="Late fee wording may need tightening" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">
            How to improve it
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Define a reasonable notice window for entry and emergencies.</p>
          <p>Add clear itemization steps for deposit deductions.</p>
          <p>Use plain language for repairs and response timelines.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">
            State-specific highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Deposit caps and deadlines vary by state.</p>
          <p>Entry notice rules differ.</p>
          <p>Repairs and habitability duties are jurisdiction-specific.</p>
        </CardContent>
      </Card>
    </section>
  )
}

