"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { GUMROAD_PRO_CHECKOUT_URL } from "@/app/lib/gumroad"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function UpgradePageClient() {
  const searchParams = useSearchParams()
  const redirectTo = (searchParams?.get("redirectTo") ?? "").trim() || "/audit"
  const [licenseKey, setLicenseKey] = useState("")
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err"
    text: string
  } | null>(null)

  function withFromUpgrade(url: string) {
    try {
      const u = new URL(url, "https://accidental-lease-ai.com")
      u.searchParams.set("fromUpgrade", "1")
      return u.pathname + u.search + u.hash
    } catch {
      return url
    }
  }

  type UnlockRedeemApiResponse =
    | { ok: true; expiresAt?: string; expiresAtIso?: string }
    | { ok: false; error?: string }

  function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null
  }

  async function onActivate(e: React.FormEvent) {
    e.preventDefault()
    setFeedback(null)
    setBusy(true)
    try {
      const r = await fetch("/api/unlock/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ licenseKey }),
      })
      const raw: unknown = await r.json().catch(() => null)
      const data: UnlockRedeemApiResponse | null = isRecord(raw) ? (raw as UnlockRedeemApiResponse) : null
      if (r.ok && data?.ok) {
        setFeedback({
          kind: "ok",
          text: "Unlocked for 10 minutes in this browser. Your first full-view + PDF response will consume the key.",
        })
        setLicenseKey("")
      } else {
        setFeedback({
          kind: "err",
          text:
            (data && "error" in data && typeof data.error === "string" ? data.error : null) ||
            "Activation failed.",
        })
      }
    } catch (err) {
      const isNetworkish =
        err instanceof TypeError ||
        (err instanceof Error &&
          /network|fetch|failed to fetch|load failed|aborted|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(
            `${err.name} ${err.message}`
          ))
      setFeedback({
        kind: "err",
        text: isNetworkish
          ? "Network connection error. Please check your network and try again."
          : "Activation failed. Please try again later or contact support.",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-[#0F172A] via-[#111C33] to-[#1E293B] px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(226,232,240,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,232,240,0.2)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-xs font-medium tracking-wide uppercase text-slate-200">
              AcciLease Pro · $8.99
            </p>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Unlock the full audit report + PDF download
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              Pro turns the preview into a deliverable: full issue list, plain-English fixes, and a PDF report you can
              share or keep on file.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={GUMROAD_PRO_CHECKOUT_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full justify-center sm:w-auto")}
              >
                <Sparkles className="size-4" aria-hidden />
                Purchase on Gumroad
              </a>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                nativeButton={false}
                render={<Link href="#redeem" />}
              >
                I already have a key
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                <LockKeyhole className="size-4" aria-hidden />
                Unlock window: 10 minutes (this browser)
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                <FileText className="size-4" aria-hidden />
                Includes 1 PDF download
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold tracking-wide uppercase text-slate-200">
              What you get
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden />
                <span>Full issue list (not just the preview)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden />
                <span>Suggested clause improvements (plain English)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden />
                <span>State-aware references for attorney review</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden />
                <span>Downloadable PDF report (1 download)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Preview vs. Pro</CardTitle>
            <CardDescription>
              Pro is designed for a clear deliverable you can act on — not just a teaser.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                Preview
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-muted-foreground" aria-hidden />
                  <span>Top 3 issues only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-muted-foreground" aria-hidden />
                  <span>No PDF download</span>
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
              <p className="text-xs font-semibold tracking-wide uppercase text-primary">
                Pro
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 text-primary" aria-hidden />
                  <span>Full issues + recommended actions</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 text-primary" aria-hidden />
                  <span>PDF report download included</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card id="redeem">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Redeem your License Key</CardTitle>
            <CardDescription>
              Paste your Gumroad key to unlock in this browser (httpOnly session cookie).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={onActivate} className="space-y-4">
              {feedback ? (
                <Alert variant={feedback.kind === "err" ? "destructive" : "default"}>
                  <AlertTitle>{feedback.kind === "ok" ? "Completed" : "Activation Failed"}</AlertTitle>
                  <AlertDescription>{feedback.text}</AlertDescription>
                </Alert>
              ) : null}

                {feedback?.kind === "ok" ? (
                  <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                    <p className="text-xs font-semibold tracking-wide uppercase text-primary">
                      Next step
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto"
                        nativeButton={false}
                        render={<Link href={withFromUpgrade(redirectTo)} />}
                      >
                        Continue
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto"
                        nativeButton={false}
                        render={<Link href="/audit?fromUpgrade=1" />}
                      >
                        Audit a lease
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto"
                        nativeButton={false}
                        render={<Link href="/generate?fromUpgrade=1" />}
                      >
                        Generate a lease
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Tip: go back and rerun the audit/generate action to consume the key and unlock the full PDF delivery.
                    </p>
                  </div>
                ) : null}
              <FieldGroup className="gap-3">
                <Field>
                  <FieldLabel htmlFor="upgrade-license">License Key</FieldLabel>
                  <Input
                    id="upgrade-license"
                    name="license"
                    autoComplete="off"
                    placeholder="Paste your Gumroad-provided Key"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    disabled={busy}
                  />
                </Field>
              </FieldGroup>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  size="lg"
                  disabled={busy || !licenseKey.trim()}
                  className="w-full sm:w-auto"
                >
                  {busy ? "Verifying..." : "Unlock now"}
                </Button>
                <a
                  href={GUMROAD_PRO_CHECKOUT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center sm:w-auto")}
                >
                  Buy a key on Gumroad
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                After payment, copy your License Key from the Gumroad receipt or your Gumroad “Library”.
              </p>
            </form>
          </CardContent>
        </Card>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          Back to Home
        </Link>
        {" · "}
        <Link href="/audit" className="underline underline-offset-4">
          Audit a lease
        </Link>
        {" · "}
        <Link href="/generate" className="underline underline-offset-4">
          Generate a Lease
        </Link>
      </p>
    </div>
  )
}
