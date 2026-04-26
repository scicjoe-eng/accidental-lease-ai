"use client"

import Link from "next/link"
import { FileSearch, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-[#0F172A] via-[#111C33] to-[#1E293B] px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(226,232,240,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.2)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative space-y-6">
        <p className="text-xs font-medium tracking-wide uppercase text-slate-200">
          AI lease tools for accidental landlords
        </p>

        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Protect your rights as an accidental landlord
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Audit an existing lease or generate a stronger one. Plain-English risks and clearer clauses—adapted to the
            state you choose.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            size="lg"
            className="w-full min-w-[220px] gap-2 sm:w-auto"
            render={<Link href="/audit" />}
          >
            <FileSearch className="size-5" aria-hidden />
            Audit Existing Lease
            <span className="ml-1 hidden text-xs font-medium text-primary-foreground/80 sm:inline">
              · Upload PDF/DOCX
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full min-w-[220px] gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
            render={<Link href="/generate" />}
          >
            <PlusCircle className="size-5" aria-hidden />
            Generate New Lease
            <span className="ml-1 hidden text-xs font-medium text-slate-200 sm:inline">
              · Quick questionnaire
            </span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-white/20 bg-white/5 text-slate-100">
            Fast
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/5 text-slate-100">
            Plain English
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/5 text-slate-100">
            State-aware (50 states + DC)
          </Badge>
        </div>

        <p className="text-xs text-slate-300">
          Built for landlords who want confidence—not legal jargon.
        </p>
      </div>
    </section>
  )
}

