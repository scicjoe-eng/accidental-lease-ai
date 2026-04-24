"use client"

import { useCallback, useRef, useState, useTransition } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Trash2,
  Upload,
} from "lucide-react"

import { runLeaseAuditAction } from "@/app/audit/actions"
import type { LeaseAuditReport } from "@/app/lib/audit"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const MAX_BYTES = 10 * 1024 * 1024
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

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

function issueRiskBadgeVariant(
  r: LeaseAuditReport["issues"][number]["risk"]
): "destructive" | "secondary" | "outline" {
  if (r === "high") return "destructive"
  if (r === "medium") return "secondary"
  return "outline"
}

export function AuditLeaseClient() {
  const inputRef = useRef<HTMLInputElement>(null)
  const downloadAnchorRef = useRef<HTMLAnchorElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [report, setReport] = useState<LeaseAuditReport | null>(null)
  const [pdfId, setPdfId] = useState<string | null>(null)
  const [meta, setMeta] = useState<{
    extractedTextLength: number
    truncated: boolean
  } | null>(null)

  const [isAuditing, setIsAuditing] = useState(false)
  const [, startTransition] = useTransition()

  const validateAndSetFile = useCallback((f: File | null) => {
    setLocalError(null)
    setActionError(null)
    setReport(null)
    setPdfId(null)
    setMeta(null)
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
            setActionError(
              "Preview only. Enter a Gumroad License Key on /upgrade to unlock full viewing and one PDF download (first full response consumes the key)."
            )
          } else {
            setActionError(null)
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
  const combinedError = localError ?? actionError
  const resultPhaseKey = isAuditing ? "loading" : report ? "result" : "idle"

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
                "flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/40"
              )}
            >
              <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                <span className="inline-flex">
                  <Upload className="text-muted-foreground size-6" aria-hidden />
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drop your PDF/DOCX here, or click to browse
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  PDF/DOCX · 10MB max
                </p>
              </div>
            </button>
          </div>

          <div className="min-h-0 space-y-2">
            {file ? (
              <div
                key="file-status"
                className="space-y-2 rounded-lg border bg-muted/30 px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                    <span className="inline-flex shrink-0">
                      <FileText className="text-muted-foreground size-4" aria-hidden />
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
                    <p className="text-muted-foreground text-xs">
                      File ready. Tap Start Audit when you are set.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div key="no-file" className="hidden" aria-hidden />
            )}
          </div>

          <div className="min-h-0">
            {combinedError ? (
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

      <div className="min-h-0" key={resultPhaseKey}>
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
                <CardTitle className="font-heading">Issues found</CardTitle>
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
                    className="bg-muted/20"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <CardTitle className="text-sm leading-snug">
                          <span>{issue.clause}</span>
                        </CardTitle>
                        <span className="inline-flex shrink-0">
                          <Badge variant={issueRiskBadgeVariant(issue.risk)}>
                            {issue.risk} risk
                          </Badge>
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Why it matters: </span>
                        <span>{issue.explanation}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Suggestion: </span>
                        <span>{issue.suggestion}</span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        <span>{issue.stateLawReference}</span>
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card key="summary-card">
              <CardHeader>
                <CardTitle className="font-heading">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  <span>{report.summary}</span>
                </p>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-0">
                  <p className="text-sm font-medium">Recommended actions</p>
                  <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1 text-sm">
                    {report.recommendedActions.map((a, i) => (
                      <li key={`action-${i}`}>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="min-h-0 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full shrink-0 sm:w-auto"
                    onClick={downloadReportPdf}
                    disabled={!pdfId}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="inline-flex shrink-0">
                        <CheckCircle2 className="size-4" aria-hidden />
                      </span>
                      <span>Download audit report PDF</span>
                    </span>
                  </Button>
                </div>
              </CardFooter>
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
