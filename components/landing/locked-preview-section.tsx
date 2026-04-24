"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type UnlockState =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "ok"; expiresAt: string }
  | { kind: "err"; message: string }

type UnlockRedeemApiResponse =
  | { ok: true; expiresAt?: string; expiresAtIso?: string }
  | { ok: false; error?: string }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function LockedPreviewPanel() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-background">
      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Preview (locked)
          </p>
          <p className="mt-1 text-sm font-medium">Top issues</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>High: Entry clause is overly broad</li>
            <li>Medium: Deposit disposition language is vague</li>
            <li>Medium: Repairs responsibilities are unclear</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium">Suggested clause improvements</p>
          <div className="mt-2 space-y-2 text-sm text-muted-foreground">
            <p>• Add reasonable notice window for entry</p>
            <p>• Add deposit return steps and itemization</p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/92 to-background/30" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="pointer-events-auto">
          <Link
            href="/upgrade"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full justify-center"
            )}
          >
            Unlock to view full results
          </Link>
        </div>
      </div>
    </div>
  )
}

export function LockedPreviewSection() {
  const [licenseKey, setLicenseKey] = useState("")
  const [state, setState] = useState<UnlockState>({ kind: "idle" })
  const [now, setNow] = useState<number>(() => Date.now())

  const expiresAtMs = useMemo(() => {
    if (state.kind !== "ok") return null
    const t = Date.parse(state.expiresAt)
    return Number.isFinite(t) ? t : null
  }, [state])

  const countdown = useMemo(() => {
    if (!expiresAtMs) return null
    return formatCountdown(expiresAtMs - now)
  }, [expiresAtMs, now])

  useEffect(() => {
    if (!expiresAtMs) return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [expiresAtMs])

  async function onUnlock(e: React.FormEvent) {
    e.preventDefault()
    const key = licenseKey.trim()
    if (!key) return
    setState({ kind: "busy" })
    try {
      const r = await fetch("/api/unlock/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ licenseKey: key }),
      })
      const raw: unknown = await r.json().catch(() => null)
      const data: UnlockRedeemApiResponse | null = isRecord(raw) ? (raw as UnlockRedeemApiResponse) : null
      const expiresAt =
        data && data.ok
          ? typeof data.expiresAt === "string"
            ? data.expiresAt
            : typeof data.expiresAtIso === "string"
              ? data.expiresAtIso
              : null
          : null

      if (!r.ok || !data?.ok || !expiresAt) {
        setState({
          kind: "err",
          message:
            (data && "error" in data && typeof data.error === "string" ? data.error : null) ||
            "Unlock failed.",
        })
        return
      }
      setLicenseKey("")
      setState({ kind: "ok", expiresAt })
    } catch {
      setState({ kind: "err", message: "Unlock failed." })
    }
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <LockedPreviewPanel />

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Unlock full view</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.kind === "ok" ? (
            <Alert>
              <AlertTitle>Unlocked</AlertTitle>
              <AlertDescription>
                {countdown ? (
                  <span>
                    Full view is unlocked in this browser for{" "}
                    <strong className="text-foreground">{countdown}</strong>.
                  </span>
                ) : (
                  <span>Full view is unlocked in this browser.</span>
                )}
              </AlertDescription>
            </Alert>
          ) : state.kind === "err" ? (
            <Alert variant="destructive">
              <AlertTitle>Unlock failed</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={onUnlock} className="space-y-3">
            <Input
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Paste your License Key"
              autoComplete="off"
              disabled={state.kind === "busy"}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                variant="secondary"
                disabled={state.kind === "busy" || !licenseKey.trim()}
                className="w-full sm:w-auto"
              >
                {state.kind === "busy" ? "Verifying..." : "Unlock"}
              </Button>
              <Link
                href="/upgrade"
                className={cn(buttonVariants({ variant: "link" }), "justify-start")}
              >
                Get a Key on Gumroad
              </Link>
            </div>
          </form>

          <p className="text-xs text-muted-foreground">
            Unlock = 10-minute full view in this browser. First full view consumes
            the key. One PDF download.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

