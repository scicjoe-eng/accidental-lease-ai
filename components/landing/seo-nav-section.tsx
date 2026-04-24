"use client"

import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SeoNavSection() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Learn first</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Link className="text-primary hover:underline" href="/accidental-landlord-guide">
            Accidental landlord guide
          </Link>
          <Link className="text-primary hover:underline" href="/landlord-tenant-laws">
            Landlord-tenant laws (50 states + DC)
          </Link>
          <Link className="text-primary hover:underline" href="/lease-guide">
            Lease agreement guide
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Explore</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Link className="text-primary hover:underline" href="/features">
            Features overview
          </Link>
          <Link className="text-primary hover:underline" href="/features/lease-analyzer">
            Lease analyzer
          </Link>
          <Link className="text-primary hover:underline" href="/blog">
            Blog
          </Link>
        </CardContent>
      </Card>
    </section>
  )
}

