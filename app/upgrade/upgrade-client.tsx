"use client"

import { useState } from "react"
import Link from "next/link"

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
  const [licenseKey, setLicenseKey] = useState("")
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err"
    text: string
  } | null>(null)

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
    <div className="mx-auto max-w-lg space-y-8">
      <div className="text-center">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          AcciLease Pro · $8.99
        </p>
        <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight">
          Upgrade to Pro
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Secure checkout via Gumroad; paste your License Key on this page to unlock in this browser (httpOnly
          session cookie).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">What Pro Includes</CardTitle>
          <CardDescription className="text-pretty">
            After redeeming your key, you get a short viewing window in this browser. Your first complete
            full-result response (generate or audit) plus PDF consumes the key; watermark is removed on that
            delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <a
            href={GUMROAD_PRO_CHECKOUT_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "default" }),
              "inline-flex w-full justify-center sm:w-auto"
            )}
          >
            Purchase Pro on Gumroad
          </a>
          <p className="text-xs text-muted-foreground">
            After payment, copy your License Key from the Gumroad receipt or &quot;Library&quot;.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Already have a License Key?</CardTitle>
          <CardDescription>Paste your Key below to unlock in this browser session.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onActivate} className="space-y-4">
            {feedback ? (
              <Alert variant={feedback.kind === "err" ? "destructive" : "default"}>
                <AlertTitle>{feedback.kind === "ok" ? "Completed" : "Activation Failed"}</AlertTitle>
                <AlertDescription>{feedback.text}</AlertDescription>
              </Alert>
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
            <Button
              type="submit"
              variant="secondary"
              disabled={busy || !licenseKey.trim()}
              className="w-full sm:w-auto"
            >
              {busy ? "Verifying..." : "Unlock"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/" className="underline underline-offset-4">
          Back to Home
        </Link>
        {" · "}
        <Link href="/generate" className="underline underline-offset-4">
          Generate a Lease
        </Link>
      </p>
    </div>
  )
}
