"use client"

import Link from "next/link"
import { FileSearch, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function LandingHero() {
  return (
    <section className="space-y-5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        AI lease tools for accidental landlords
      </p>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Audit a lease or generate a stronger one
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
          Plain-English risks and clearer clauses for accidental landlords.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          size="lg"
          className="h-12 w-full min-w-[220px] gap-2 sm:w-auto"
          render={<Link href="/audit" />}
        >
          <FileSearch className="size-5" aria-hidden />
          Audit Existing Lease
          <span className="text-primary-foreground/80 ml-1 hidden text-xs font-medium sm:inline">
            · Upload PDF/DOCX
          </span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 w-full min-w-[220px] gap-2 sm:w-auto"
          render={<Link href="/generate" />}
        >
          <PlusCircle className="size-5" aria-hidden />
          Generate New Lease
          <span className="text-muted-foreground ml-1 hidden text-xs font-medium sm:inline">
            · Quick questionnaire
          </span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Fast</Badge>
        <Badge variant="secondary">Plain English</Badge>
        <Badge variant="secondary">State-aware</Badge>
      </div>
    </section>
  )
}

