"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  LockKeyhole,
  Scale,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react"

import { runLeaseAuditAction } from "@/app/audit/actions"
import type { LeaseAuditReport } from "@/app/lib/audit"
import { GUMROAD_PRO_CHECKOUT_URL } from "@/app/lib/gumroad"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const MAX_BYTES = 10 * 1024 * 1024
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

type StoredAuditPreview = {
  report: LeaseAuditReport
  meta: { extractedTextLength: number; truncated: boolean } | null
  lockedTotals: { totalIssues: number; totalRecommendedActions: number } | null
  lockedPreview: boolean
  savedAt: number
}

function loadStoredAuditPreview(): StoredAuditPreview | null {
  if (typeof window === "undefined") return null
  const raw = window.sessionStorage.getItem("accilease:lastAuditPreview")
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredAuditPreview
    if (typeof parsed?.savedAt !== "number") return null
    if (Date.now() - parsed.savedAt > 30 * 60 * 1000) {
      window.sessionStorage.removeItem("accilease:lastAuditPreview")
      return null
    }
    if (!parsed.report) return null
    return parsed
  } catch {
    window.sessionStorage.removeItem("accilease:lastAuditPreview")
    return null
  }
}

function riskScoreNumber(report: LeaseAuditReport): number {
  switch (report.riskScore) {
    case "red":
      return 82
    case "yellow":
      return 55
    default:
      return 28
  }
}

function riskBlockStyles(score: LeaseAuditReport["riskScore"]) {
  switch (score) {
    case "red":
      return {
        container:
          "border-red-500/35 bg-gradient-to-br from-red-600/95 to-red-800 text-white shadow-[0_20px_50px_-24px_rgba(220,38,38,0.75)]",
        badge: "bg-white/15 text-white ring-1 ring-white/25",
        sub: "text-white/85",
      }
    case "yellow":
      return {
        container:
          "border-amber-500/40 bg-gradient-to-br from-amber-500/95 to-amber-700 text-amber-950 shadow-[0_20px_50px_-24px_rgba(217,119,6,0.55)]",
        badge: "bg-black/10 text-amber-950 ring-1 ring-black/10",
        sub: "text-amber-950/85",
      }
    default:
      return {
        container:
          "border-emerald-500/35 bg-gradient-to-br from-emerald-600/95 to-emerald-800 text-white shadow-[0_20px_50px_-24px_rgba(5,150,105,0.55)]",
        badge: "bg-white/15 text-white ring-1 ring-white/25",
        sub: "text-white/85",
      }
  }
}

function countIssues(report: LeaseAuditReport) {
  let high = 0
  let medium = 0
  let low = 0
  for (const i of report.issues) {
    if (i.risk === "high") high++
    else if (i.risk === "medium") medium++
    else low++
  }
  return { high, medium, low }
}

function issueRiskBadgeVariant(
  r: LeaseAuditReport["issues"][number]["risk"]
): "destructive" | "secondary" | "outline" {
  if (r === "high") return "destructive"
  if (r === "medium") return "secondary"
  return "outline"
}

function issueCardTone(risk: LeaseAuditReport["issues"][number]["risk"]) {
  if (risk === "high") {
    return {
      card: "border-l-4 border-l-red-500 bg-red-500/5",
      badge: "bg-red-500/10 text-red-700 ring-1 ring-red-500/20 dark:text-red-300",
      callout: "border-red-500/25 bg-red-500/5 text-red-900 dark:text-red-100",
    }
  }
  if (risk === "medium") {
    return {
      card: "border-l-4 border-l-amber-500 bg-amber-500/5",
      badge:
        "bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200",
      callout:
        "border-amber-500/25 bg-amber-500/5 text-amber-950 dark:text-amber-50",
    }
  }
  return {
    card: "border-l-4 border-l-emerald-500 bg-emerald-500/5",
    badge:
      "bg-emerald-500/10 text-emerald-800 ring-1 ring-emerald-500/20 dark:text-emerald-200",
    callout:
      "border-emerald-500/25 bg-emerald-500/5 text-emerald-950 dark:text-emerald-50",
  }
}

export function AuditLeaseClient() {
  const inputRef = useRef<HTMLInputElement>(null)
  const downloadAnchorRef = useRef<HTMLAnchorElement>(null)

  const stored = loadStoredAuditPreview()

  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [report, setReport] = useState<LeaseAuditReport | null>(() => stored?.report ?? null)
  const [pdfId, setPdfId] = useState<string | null>(null)
  const [lockedPreview, setLockedPreview] = useState(() => stored?.lockedPreview === true)
  const [lockedTotals, setLockedTotals] = useState<{
    totalIssues: number
    totalRecommendedActions: number
  } | null>(() => stored?.lockedTotals ?? null)
  const [meta, setMeta] = useState<{
    extractedTextLength: number
    truncated: boolean
  } | null>(() => stored?.meta ?? null)

  const [isAuditing, setIsAuditing] = useState(false)
  const [, startTransition] = useTransition()

  // If returning from /upgrade, scroll to results.
  useEffect(() => {
    if (typeof window === "undefined") return
    const sp = new URLSearchParams(window.location.search)
    if (sp.get("fromUpgrade") === "1") {
      window.setTimeout(() => {
        const el = document.getElementById("audit-results")
        el?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!report || !lockedPreview) return
    window.sessionStorage.setItem(
      "accilease:lastAuditPreview",
      JSON.stringify({
        report,
        meta,
        lockedTotals,
        lockedPreview: true,
        savedAt: Date.now(),
      })
    )
  }, [report, meta, lockedTotals, lockedPreview])

  const validateAndSetFile = useCallback((f: File | null) => {
    setLocalError(null)
    setActionError(null)
    setReport(null)
    setPdfId(null)
    setMeta(null)
    setLockedPreview(false)
    setLockedTotals(null)
    if (!f) {
      setFile(null)
      setUploadProgress(0)
      return
    }
    if (f.size > MAX_BYTES) {
      setLocalError("File must be 10MB or smaller.")
      setFile(null)
      setUploadProgress(0)
      return
    }
    const name = f.name.toLowerCase()
    const isPdf = f.type === "application/pdf" || name.endsWith(".pdf")
    const isDocx = f.type === DOCX_MIME || name.endsWith(".docx")
    if (!isPdf && !isDocx) {
      setLocalError("Please choose a PDF or DOCX file.")
      setFile(null)
      setUploadProgress(0)
      return
    }
    setFile(f)
    setUploadProgress(100)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      const f = e.dataTransfer.files?.[0]
      if (f) validateAndSetFile(f)
    },
    [validateAndSetFile]
  )

  const removeSelectedFile = useCallback(() => {
    if (isAuditing) return
    setFile(null)
    setUploadProgress(0)
    setLocalError(null)
    setActionError(null)
    setReport(null)
    setPdfId(null)
    setMeta(null)
    setLockedPreview(false)
    setLockedTotals(null)
    const input = inputRef.current
    if (input) input.value = ""
  }, [isAuditing])

  const onAudit = () => {
    if (!file || isAuditing) return
    setActionError(null)
    setIsAuditing(true)

    const fd = new FormData()
    fd.set("file", file)

    void runLeaseAuditAction(fd)
      .then((res) => {
        startTransition(() => {
          if (!res.ok) {
            setActionError(res.error)
            setReport(null)
            setPdfId(null)
            setMeta(null)
            return
          }
          if (res.locked) {
            setLockedPreview(true)
            setLockedTotals({
              totalIssues: res.totalIssues ?? res.report.issues.length,
              totalRecommendedActions:
                res.totalRecommendedActions ?? res.report.recommendedActions.length,
            })
            setActionError(
              "Preview only. Enter a Gumroad License Key on /upgrade to unlock full viewing and one PDF download (first full response consumes the key)."
            )
          } else {
            setActionError(null)
            setLockedPreview(false)
            setLockedTotals(null)
          }
          setReport(res.report)
          setPdfId(res.pdfId ?? null)
          setMeta({
            extractedTextLength: res.extractedTextLength,
            truncated: res.truncated,
          })
        })
      })
      .catch(() => {
        startTransition(() => {
          setActionError("Something went wrong. Please try again.")
          setReport(null)
          setPdfId(null)
          setMeta(null)
          setLockedPreview(false)
          setLockedTotals(null)
        })
      })
      .finally(() => {
        setIsAuditing(false)
      })
  }

  const downloadReportPdf = () => {
    if (!pdfId || !file) return
    const anchor = downloadAnchorRef.current
    if (!anchor) return

    const base = file.name.replace(/\.(pdf|docx)$/i, "") || "lease"
    anchor.href = `/api/pdf/${pdfId}`
    anchor.download = `${base}-audit-report.pdf`
    anchor.click()
  }

  const styles = report ? riskBlockStyles(report.riskScore) : null
  const combinedError = localError ?? (lockedPreview ? null : actionError)
  const resultPhaseKey = isAuditing ? "loading" : report ? "result" : "idle"
  const issueCounts = report ? countIssues(report) : null
  const score = report ? riskScoreNumber(report) : null
  const previewIssuesCount = report?.issues.length ?? 0

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 text-foreground">
      <a
        ref={downloadAnchorRef}
        href=""
        download=""
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />

      <header className="space-y-2 text-center sm:text-left">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Lease Contract Auditor
        </p>
        <h1 className="font-heading text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
          Audit Your Existing Lease • Find Risks Fast
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Upload a residential lease PDF or DOCX. We extract the text, scan
          for common accidental-landlord risk patterns, and return structured
          findings — not legal advice.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link href="/dashboard" />}
          >
            Dashboard
          </Button>
          <Button
            nativeButton={false}
            variant="ghost"
            size="sm"
            render={<Link href="/generate" />}
          >
            Generate lease
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Upload lease (PDF or DOCX)</CardTitle>
          <CardDescription>
            Drag and drop or browse. Maximum file size 10MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-0">
            <input
              ref={inputRef}
              type="file"
              accept={`application/pdf,${DOCX_MIME},.pdf,.docx`}
              className="sr-only"
              onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="min-h-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={cn(
                "flex min-h-[190px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ease-out",
                dragActive
                  ? "border-primary bg-primary/10 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                  : "border-slate-300/70 bg-background hover:border-primary/60 hover:bg-primary/5 dark:border-slate-600/60",
                isAuditing && "animate-pulse"
              )}
            >
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-full ring-1 ring-border/70 transition-all",
                  dragActive ? "bg-primary/15 ring-primary/30" : "bg-muted/60"
                )}
              >
                <span className="inline-flex">
                  <Upload
                    className={cn(
                      "size-6",
                      dragActive ? "text-primary" : "text-muted-foreground"
                    )}
                    aria-hidden
                  />
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">
                  {isAuditing
                    ? "Analyzing your lease…"
                    : "Drop your PDF/DOCX here, or click to browse"}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {isAuditing
                    ? "This can take up to a minute."
                    : "PDF/DOCX · 10MB max"}
                </p>
              </div>
            </button>
          </div>

          <div className="min-h-0 space-y-2">
            {file ? (
              <div
                key="file-status"
                className="space-y-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                    <span className="inline-flex shrink-0">
                      {isAuditing ? (
                        <Upload className="size-4 text-primary" aria-hidden />
                      ) : (
                        <CheckCircle2 className="size-4 text-primary" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 truncate font-medium" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isAuditing}
                    onClick={removeSelectedFile}
                    title="删除文件 · Clear selection and audit results"
                    className="w-full shrink-0 gap-1.5 border-destructive/35 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto dark:border-destructive/50 dark:hover:bg-destructive/15"
                    aria-label="Remove file, 删除文件. Clears selection and audit results."
                  >
                    <Trash2 className="size-4 shrink-0" aria-hidden />
                    <span>Remove file</span>
                    <span
                      className="text-muted-foreground hidden font-normal sm:inline"
                      aria-hidden
                    >
                      （删除文件）
                    </span>
                  </Button>
                </div>
                <div className="min-h-2">
                  <Progress
                    value={uploadProgress}
                    max={100}
                    indeterminate={isAuditing}
                  />
                </div>
                <div className="min-h-4">
                  {isAuditing ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs">
                        Auditing your lease… this can take a minute.
                      </p>
                      <div className="flex gap-2">
                        <Skeleton className="h-2 flex-1 rounded-full" />
                        <Skeleton className="h-2 w-16 rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Ready to audit. Tap <span className="font-medium text-foreground">Start Audit</span>.
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/15">
                        ✓ File validated
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key="no-file" className="hidden" aria-hidden />
            )}
          </div>

          <div className="min-h-0">
            {lockedPreview && actionError ? (
              <div className="min-h-0">
                <Alert className="border-primary/25 bg-primary/10">
                  <LockKeyhole className="text-primary" aria-hidden />
                  <AlertTitle>Preview mode (locked)</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-3">
                      <p>{actionError}</p>

                      {lockedTotals ? (
                        <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs">
                          <p className="font-medium text-foreground">What you’re seeing</p>
                          <p className="mt-2 text-muted-foreground">
                            Showing <span className="font-medium text-foreground">{previewIssuesCount}</span> of{" "}
                            <span className="font-medium text-foreground">{lockedTotals.totalIssues}</span> issues,
                            and <span className="font-medium text-foreground">{Math.min(3, lockedTotals.totalRecommendedActions)}</span> of{" "}
                            <span className="font-medium text-foreground">{lockedTotals.totalRecommendedActions}</span>{" "}
                            recommended actions.
                          </p>
                        </div>
                      ) : null}

                      <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs">
                        <p className="font-medium text-foreground">Unlock includes</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                          <li>Full issue list (not just the top preview)</li>
                          <li>One downloadable PDF audit report</li>
                          <li>10-minute full view in this browser</li>
                        </ul>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-card/50 p-4">
                        <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                          PDF report preview
                        </p>
                        <div className="mt-3 overflow-hidden rounded-lg border border-border/60 bg-background">
                          <div className="space-y-3 p-4">
                            <div className="h-3 w-2/3 rounded bg-muted/60" />
                            <div className="h-2 w-1/2 rounded bg-muted/50" />
                            <div className="h-2 w-11/12 rounded bg-muted/50" />
                            <div className="h-2 w-10/12 rounded bg-muted/50" />
                            <div className="h-2 w-9/12 rounded bg-muted/50" />
                          </div>
                          <div className="relative h-16 border-t border-border/60 bg-muted/20">
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                                Unlock to download the full PDF
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                          size="lg"
                          className="w-full sm:w-auto"
                          nativeButton={false}
                          render={<Link href="/upgrade?redirectTo=/audit#redeem" />}
                        >
                          Redeem key
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto"
                          nativeButton={false}
                          render={<Link href="/upgrade?redirectTo=/audit#redeem" />}
                        >
                          I already have a key
                        </Button>
                        <a
                          href={GUMROAD_PRO_CHECKOUT_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:w-auto"
                        >
                          Buy Pro on Gumroad
                        </a>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            ) : combinedError ? (
              <div key="error-alert" className="min-h-0">
                <Alert variant="destructive">
                  <AlertTriangle aria-hidden />
                  <AlertTitle>Something went wrong</AlertTitle>
                  <AlertDescription>
                    <span>{combinedError}</span>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div key="no-error" className="hidden" aria-hidden />
            )}
          </div>

          <div className="min-h-0">
            <Button
              type="button"
              size="lg"
              className="h-11 w-full text-base sm:h-12"
              disabled={!file || isAuditing}
              onClick={onAudit}
            >
              <span
                className="inline-flex items-center justify-center gap-2"
                key={isAuditing ? "audit-pending" : "audit-idle"}
              >
                {isAuditing ? (
                  <>
                    <span className="inline-flex size-4 items-center justify-center">
                      <Skeleton className="size-4 rounded-full" />
                    </span>
                    <span>Auditing…</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex shrink-0">
                      <ShieldAlert className="size-4" aria-hidden />
                    </span>
                    <span>Start Audit</span>
                  </>
                )}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div id="audit-results" className="min-h-0 scroll-mt-20" key={resultPhaseKey}>
        {report && styles ? (
          <div className="flex flex-col gap-6">
            <div
              key="risk-block"
              className={cn(
                "rounded-2xl border p-6 sm:p-8",
                styles.container
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-h-0">
                  <p className={cn("text-sm font-medium", styles.sub)}>
                    Overall risk index
                  </p>
                  <p className="mt-1 text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
                    <span>{riskScoreNumber(report)}</span>
                  </p>
                  <p className={cn("mt-1 text-sm", styles.sub)}>
                    <span>out of 100</span>
                  </p>
                </div>
                <div className="flex min-h-0 flex-col items-start gap-2 sm:items-end">
                  <span className="inline-flex">
                    <Badge className={styles.badge}>
                      {report.riskScore === "red"
                        ? "Elevated risk"
                        : report.riskScore === "yellow"
                          ? "Moderate risk"
                          : "Lower risk"}
                    </Badge>
                  </span>
                  <p className={cn("text-sm font-medium", styles.sub)}>
                    <span>
                      Overall: {report.overallRisk} · Band: {report.riskScore}
                    </span>
                  </p>
                </div>
              </div>

              {typeof score === "number" ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className={styles.sub}>Lower</span>
                    <span className={styles.sub}>Higher</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={score} max={100} className="bg-white/10" />
                  </div>
                </div>
              ) : null}

              {issueCounts ? (
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
                    <p className={cn("text-xs font-medium uppercase tracking-wide", styles.sub)}>
                      High risk
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{issueCounts.high}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
                    <p className={cn("text-xs font-medium uppercase tracking-wide", styles.sub)}>
                      Medium
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{issueCounts.medium}</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15">
                    <p className={cn("text-xs font-medium uppercase tracking-wide", styles.sub)}>
                      Low
                    </p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{issueCounts.low}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="min-h-0">
              {meta?.truncated ? (
                <div key="truncated-alert">
                  <Alert>
                    <AlertTitle>Partial document</AlertTitle>
                    <AlertDescription>
                      <span>
                        Only the beginning of the PDF was sent to the model due to
                        length limits. Treat gaps cautiously and verify material
                        clauses with counsel.
                      </span>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div key="no-truncate" className="hidden" aria-hidden />
              )}
            </div>

            <Card key="issues-card">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="font-heading">Issues found</CardTitle>
                  {lockedPreview && lockedTotals ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary/10 text-primary ring-1 ring-primary/20">
                        {previewIssuesCount} shown / {lockedTotals.totalIssues} total
                      </Badge>
                      {lockedTotals.totalIssues > previewIssuesCount ? (
                        <Badge
                          variant="outline"
                          className="border-primary/30 bg-background/60 text-foreground"
                        >
                          +{lockedTotals.totalIssues - previewIssuesCount} locked
                        </Badge>
                      ) : null}
                    </span>
                  ) : null}
                </div>
                <CardDescription>
                  <span>
                    {report.issues.length} flagged item
                    {report.issues.length === 1 ? "" : "s"}
                    {meta
                      ? ` · ${meta.extractedTextLength.toLocaleString()} characters extracted`
                      : ""}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.issues.map((issue, idx) => (
                    <Card
                      key={`issue-${idx}-${issue.clause.slice(0, 48)}`}
                      size="sm"
                      className={cn("bg-background", issueCardTone(issue.risk).card)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <CardTitle className="text-sm leading-snug">
                            <span>{issue.clause}</span>
                          </CardTitle>
                          <span className="inline-flex shrink-0">
                            <Badge
                              variant={issueRiskBadgeVariant(issue.risk)}
                              className={issueCardTone(issue.risk).badge}
                            >
                              {issue.risk} risk
                            </Badge>
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                            Why it matters
                          </p>
                          <p className="leading-relaxed">{issue.explanation}</p>
                        </div>

                        <div
                          className={cn(
                            "rounded-lg border p-3",
                            issueCardTone(issue.risk).callout
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Lightbulb className="mt-0.5 size-4 opacity-80" aria-hidden />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold tracking-wide uppercase">
                                Suggested improvement
                              </p>
                              <p className="mt-1 leading-relaxed">{issue.suggestion}</p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                          <div className="flex items-start gap-2">
                            <Scale className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                                State law reference
                              </p>
                              <p className="mt-1 text-xs font-mono leading-relaxed text-muted-foreground">
                                {issue.stateLawReference}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </CardContent>
            </Card>

            <Card key="summary-card">
              <CardHeader>
                <CardTitle className="font-heading">Executive summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  <span>{report.summary}</span>
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Recommended actions (next steps)
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {report.recommendedActions.map((a, i) => (
                        <li key={`action-${i}`} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden />
                          <span className="leading-relaxed">{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                    <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                      Deliverables
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 size-1.5 rounded-full bg-primary" aria-hidden />
                        <span>Plain-English risk explanations and suggested clause fixes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 size-1.5 rounded-full bg-primary" aria-hidden />
                        <span>State-aware references to review with counsel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 size-1.5 rounded-full bg-primary" aria-hidden />
                        <span>PDF report for sharing and record-keeping</span>
                      </li>
                    </ul>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        className="w-full sm:w-auto"
                        onClick={lockedPreview ? undefined : downloadReportPdf}
                        disabled={lockedPreview || !pdfId}
                      >
                        {lockedPreview ? "Unlock full report (PDF included)" : "Download PDF report"}
                      </Button>
                      {lockedPreview ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          nativeButton={false}
                          render={<Link href="/upgrade?redirectTo=/audit#redeem" />}
                        >
                          Unlock now (view all issues)
                        </Button>
                      ) : null}
                    </div>

                    {lockedPreview ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        You’re viewing a preview. Unlock to see all flagged issues and download the full PDF report.
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div key="disclaimer-alert" className="min-h-0">
              <div className="hidden" aria-hidden />
            </div>
          </div>
        ) : (
          <div key="no-results" className="hidden" aria-hidden />
        )}

      </div>

      <p className="hidden" aria-hidden />
    </div>
  )
}
