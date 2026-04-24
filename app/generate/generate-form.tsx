"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { addYears, format, isValid, parseISO } from "date-fns"
import { CalendarIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { generateLeasePdfAction } from "@/app/generate/actions"
import {
  type LeaseContract,
} from "@/app/lib/ai"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { WatermarkUpgradePrompt } from "@/components/subscription/watermark-upgrade-prompt"

import {
  US_JURISDICTIONS,
  findJurisdictionByLabel,
  formatJurisdictionLabel,
} from "./us-jurisdictions"

const PROPERTY_TYPE_OPTIONS = [
  "Single-family home",
  "Multi-unit / small multifamily",
  "Apartment (unit in a building)",
  "Condominium",
  "Townhouse",
  "Accessory dwelling unit (ADU)",
  "Other / mixed-use",
] as const

const TERM_TYPE_OPTIONS = ["Fixed-term", "Month-to-month"] as const

const DEPOSIT_MODE_OPTIONS = ["No deposit", "Deposit"] as const

const PAYMENT_METHOD_OPTIONS = [
  "ACH / bank transfer",
  "Zelle",
  "Check",
  "Cash",
  "Other",
] as const

const UTILITIES_OPTIONS = [
  "Electric",
  "Gas",
  "Water",
  "Trash",
  "Sewer",
  "Internet",
  "Other",
] as const

const STREAM_PHASE_HINTS = [
  "AI is thinking…",
  "Generating lease terms…",
  "Finalizing document…",
] as const

function LeaseDraftPreview({ contract }: { contract: LeaseContract }) {
  return (
    <div className="space-y-4">
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertTitle className="text-amber-100">Important</AlertTitle>
        <AlertDescription className="text-amber-100/90">
          {contract.disclaimer_banner}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg leading-snug">{contract.title}</CardTitle>
          <CardDescription>Draft outline for attorney review — not a final lease.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Parties & premises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Landlord
              </p>
              <p className="mt-1 leading-relaxed">{contract.parties.landlord}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tenant(s)
              </p>
              <p className="mt-1 leading-relaxed">{contract.parties.tenant}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Premises
            </p>
            <p className="mt-1 leading-relaxed">{contract.parties.premises_address}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Term, rent & deposit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Lease term
              </p>
              <p className="mt-1">
                {contract.term.start_date}
                {contract.term.end_date ? ` → ${contract.term.end_date}` : ""}
              </p>
              <p className="mt-1 text-muted-foreground">
                {contract.term.is_month_to_month
                  ? "Includes month-to-month language."
                  : "Fixed term as stated."}
                {contract.term.notes ? ` ${contract.term.notes}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Monthly rent
              </p>
              <p className="mt-1 font-medium">{contract.rent.amount}</p>
              {contract.rent.due ? (
                <p className="mt-1 text-muted-foreground">Due: {contract.rent.due}</p>
              ) : null}
              {contract.rent.late_fees ? (
                <p className="mt-1 text-muted-foreground">Late fees: {contract.rent.late_fees}</p>
              ) : null}
              {contract.rent.payment ? (
                <p className="mt-1 text-muted-foreground">Payment: {contract.rent.payment}</p>
              ) : null}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Security deposit
            </p>
            <p className="mt-1 font-medium">{contract.deposit.amount}</p>
            {contract.deposit.disposition ? (
              <p className="mt-1 text-muted-foreground">{contract.deposit.disposition}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Governing law</CardTitle>
          <CardDescription>{contract.governing_law.state}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {contract.governing_law.choice_of_law_notes ? (
            <p className="text-muted-foreground leading-relaxed">
              {contract.governing_law.choice_of_law_notes}
            </p>
          ) : null}
          {contract.governing_law.state_highlights.length > 0 ? (
            <ul className="list-inside list-disc space-y-1.5 text-muted-foreground">
              {contract.governing_law.state_highlights.map((h, i) => (
                <li key={i} className="leading-relaxed">
                  {h}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Key clauses</CardTitle>
          <CardDescription>{contract.clauses.length} sections in this draft</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {contract.clauses.map((clause, i) => (
            <div key={i}>
              <p className="text-sm font-semibold">
                {i + 1}. {clause.title}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {clause.text}
              </p>
              {i < contract.clauses.length - 1 ? <Separator className="mt-6" /> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function parseIsoDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const d = parseISO(value)
  return isValid(d) ? d : undefined
}

export const generateLeaseFormSchema = z.object({
  jurisdiction_state: z
    .string()
    .min(1, "Select a state or District of Columbia."),
  premises_address: z.string().max(4000),
  property_type: z.string().max(500),
  landlord_name: z.string().min(1, "Landlord name is required."),
  landlord_contact: z.string().max(500),
  tenant_names: z.string().min(1, "Tenant name is required."),
  tenant_contact: z.string().max(500),
  lease_start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid start date."),
  term_type: z.enum(TERM_TYPE_OPTIONS, {
    message: "Select a lease term type.",
  }),
  /** Optional on form; defaults to start + 1 year in the API payload when blank. */
  lease_end_date: z
    .string()
    .refine(
      (s) => s === "" || /^\d{4}-\d{2}-\d{2}$/.test(s),
      "Choose a valid end date."
    ),
  monthly_rent: z.string().min(1, "Monthly rent is required."),
  rent_due_day: z.string().max(120),
  deposit_mode: z.enum(DEPOSIT_MODE_OPTIONS, { message: "Select a deposit mode." }),
  deposit_amount: z.string().max(120),
  security_deposit: z.string().max(120), // legacy compatibility; derived from deposit_mode/deposit_amount
  payment_method: z.enum(PAYMENT_METHOD_OPTIONS, { message: "Select a payment method." }),
  payment_notes: z.string().max(500),
  utilities_multi: z.array(z.enum(UTILITIES_OPTIONS)).max(UTILITIES_OPTIONS.length),
  utilities_included: z.string().max(2000),
  pets_policy: z.string().max(2000),
  parking_storage: z.string().max(2000),
  maintenance_resp: z.string().max(2000),
  special_terms: z.string().max(8000),
})

export type GenerateLeaseFormValues = z.infer<typeof generateLeaseFormSchema>

function buildLeaseRequestBody(values: GenerateLeaseFormValues): Record<string, unknown> {
  const trimOpt = (s: string | undefined) => {
    const v = (s ?? "").trim()
    return v === "" ? undefined : v
  }
  const utilitiesText =
    values.utilities_multi?.length
      ? `Utilities included: ${values.utilities_multi.join(", ")}.`
      : undefined

  const securityDepositDerived =
    values.deposit_mode === "No deposit"
      ? "None"
      : trimOpt(values.deposit_amount) ?? trimOpt(values.security_deposit)

  return {
    jurisdiction_state: values.jurisdiction_state.trim(),
    premises_address: values.premises_address.trim(),
    property_type: trimOpt(values.property_type),
    landlord_name: values.landlord_name.trim(),
    landlord_contact: trimOpt(values.landlord_contact),
    tenant_names: values.tenant_names.trim(),
    tenant_contact: trimOpt(values.tenant_contact),
    lease_start_date: values.lease_start_date.trim(),
    term_type: values.term_type,
    lease_end_date: (() => {
      const trimmed = values.lease_end_date.trim()
      if (trimmed) return trimmed
      const s = parseIsoDate(values.lease_start_date)
      return s ? format(addYears(s, 1), "yyyy-MM-dd") : undefined
    })(),
    monthly_rent: values.monthly_rent.trim(),
    rent_due_day: trimOpt(values.rent_due_day),
    deposit_mode: values.deposit_mode,
    deposit_amount: trimOpt(values.deposit_amount),
    security_deposit: securityDepositDerived,
    payment_method: values.payment_method,
    payment_notes: trimOpt(values.payment_notes),
    utilities_multi: values.utilities_multi,
    utilities_included: trimOpt(values.utilities_included) ?? utilitiesText,
    pets_policy: trimOpt(values.pets_policy),
    parking_storage: trimOpt(values.parking_storage),
    maintenance_resp: trimOpt(values.maintenance_resp),
    special_terms: trimOpt(values.special_terms),
  }
}

function fieldErrorClass(invalid: boolean) {
  return invalid ? "border-destructive aria-invalid:border-destructive" : ""
}

export function GenerateLeaseForm() {
  const abortRef = useRef<AbortController | null>(null)
  const defaultDates = useMemo(() => {
    const start = new Date()
    return {
      lease_start_date: format(start, "yyyy-MM-dd"),
      lease_end_date: format(addYears(start, 1), "yyyy-MM-dd"),
    }
  }, [])

  const form = useForm<GenerateLeaseFormValues>({
    resolver: zodResolver(generateLeaseFormSchema),
    defaultValues: {
      jurisdiction_state: "",
      premises_address: "",
      property_type: "",
      landlord_name: "",
      landlord_contact: "",
      tenant_names: "",
      tenant_contact: "",
      lease_start_date: defaultDates.lease_start_date,
      lease_end_date: defaultDates.lease_end_date,
      term_type: "Fixed-term",
      monthly_rent: "",
      rent_due_day: "",
      deposit_mode: "Deposit",
      deposit_amount: "",
      security_deposit: "",
      payment_method: "ACH / bank transfer",
      payment_notes: "",
      utilities_multi: [],
      utilities_included: "",
      pets_policy: "",
      parking_storage: "",
      maintenance_resp: "",
      special_terms: "",
    },
  })

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form

  const jurisdictionState = useWatch({
    control,
    name: "jurisdiction_state",
  })
  const termType = useWatch({ control, name: "term_type" })
  const depositMode = useWatch({ control, name: "deposit_mode" })

  const signReadyMissingFields = useMemo(() => {
    const missing: Array<{ id: string; label: string }> = []
    const v = form.getValues()
    if (!v.premises_address?.trim()) missing.push({ id: "premises_address", label: "Premises address" })
    if (!v.rent_due_day?.trim()) missing.push({ id: "rent_due_day", label: "Rent due day" })
    if (!v.landlord_contact?.trim()) missing.push({ id: "landlord_contact", label: "Landlord contact" })
    if (v.deposit_mode === "Deposit" && !(v.deposit_amount?.trim() || v.security_deposit?.trim())) {
      missing.push({ id: "deposit_amount", label: "Security deposit amount (or select No deposit)" })
    }
    return missing
  }, [form, jurisdictionState, termType, depositMode])

  const selectedJurisdiction = useMemo(
    () => findJurisdictionByLabel(jurisdictionState ?? ""),
    [jurisdictionState]
  )

  const [stateComboOpen, setStateComboOpen] = useState(false)
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [streamPhase, setStreamPhase] = useState(0)
  const [resultContract, setResultContract] = useState<LeaseContract | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [resultIsPro, setResultIsPro] = useState<boolean | null>(null)

  const resetDownload = useCallback(() => {
    setDownloadUrl((u) => {
      return null
    })
  }, [])

  const cancelGeneration = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  useEffect(() => {
    if (!busy) return
    const t = window.setInterval(() => {
      setStreamPhase((p) => (p + 1) % STREAM_PHASE_HINTS.length)
    }, 4500)
    return () => window.clearInterval(t)
  }, [busy])

  const submitStreaming = useCallback(async (values: GenerateLeaseFormValues) => {
    setError(null)
    setResultContract(null)
    setResultIsPro(null)
    resetDownload()
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    setBusy(true)
    setStreamPhase(0)

    try {
      const body = buildLeaseRequestBody(values)
      const res = await fetch("/api/lease/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      })
      const payload = (await res.json().catch(() => ({}))) as { locked?: boolean; contractPreview?: unknown; contract?: unknown; pdfId?: string; error?: string }
      if (!res.ok) {
        throw new Error(payload.error ?? "Generation failed.")
      }
      if (payload?.locked === true) {
        if (!payload.contractPreview) {
          throw new Error("Invalid response from server.")
        }
        setResultContract(payload.contractPreview as LeaseContract)
        setResultIsPro(null)
        setError(
          "Preview only. Enter a Gumroad License Key on /upgrade to unlock full content and one PDF download (first full response consumes the key)."
        )
        return
      }
      if (!payload.contract || !payload.pdfId) {
        throw new Error("Invalid response from server.")
      }
      setResultContract(payload.contract as LeaseContract)
      setResultIsPro(null)
      setDownloadUrl(`/api/pdf/${payload.pdfId}`)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Generation cancelled.")
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.")
      }
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }, [resetDownload])

  // `handleSubmit` only runs `submitStreaming` on user submit; abortRef is not read during render.
  // eslint-disable-next-line react-hooks/refs -- false positive from passing an async fn that uses a ref
  const onSubmit = handleSubmit(submitStreaming)

  const fallbackPdfAction = handleSubmit(async (values) => {
    setError(null)
    setResultContract(null)
    setResultIsPro(null)
    resetDownload()
    setBusy(true)
    setStreamPhase(0)
    try {
      const body = buildLeaseRequestBody(values)
      const result = await generateLeasePdfAction(body)
      if (!result.ok) {
        setError(result.error)
      } else {
        if (result.locked) {
          setResultContract(result.contractPreview as LeaseContract)
          setResultIsPro(null)
          setError(
            "Preview only. Enter a Gumroad License Key on /upgrade to unlock full content and one PDF download (first full response consumes the key)."
          )
          return
        }
        setResultContract(result.contract as LeaseContract)
        setResultIsPro(null)
        setDownloadUrl(`/api/pdf/${result.pdfId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBusy(false)
    }
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Generate lease draft
          </h1>
          <p className="text-sm text-muted-foreground">
            State-aware drafting with your AcciLease RAG corpus · PDF is watermarked · Not legal
            advice.
          </p>
        </div>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
        >
          Back to dashboard
        </Link>
      </div>

      <div className="hidden" aria-hidden />

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Property & parties</CardTitle>
          <CardDescription>
            Required fields are marked. Server-side generation — API keys never reach your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={onSubmit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  State / DC <span className="text-destructive">*</span>
                </FieldLabel>
                <Controller
                  control={control}
                  name="jurisdiction_state"
                  render={({ field }) => (
                    <Popover open={stateComboOpen} onOpenChange={setStateComboOpen}>
                      <PopoverTrigger
                        type="button"
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-10 w-full justify-between font-normal",
                          !field.value && "text-muted-foreground",
                          fieldErrorClass(!!errors.jurisdiction_state)
                        )}
                        aria-expanded={stateComboOpen}
                        aria-invalid={!!errors.jurisdiction_state}
                      >
                        <span className="truncate text-left">
                          {field.value
                            ? field.value
                            : "Select a state..."}
                        </span>
                        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent
                        className="min-w-[min(100vw-2rem,400px)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="Search state (e.g. CA, Texas)..." />
                          <CommandList>
                            <CommandEmpty>No jurisdiction found.</CommandEmpty>
                            <CommandGroup>
                              {US_JURISDICTIONS.map((j) => {
                                const label = formatJurisdictionLabel(j)
                                return (
                                  <CommandItem
                                    key={j.code}
                                    value={`${j.name} ${j.code}`}
                                    onSelect={() => {
                                      field.onChange(label)
                                      setStateComboOpen(false)
                                    }}
                                  >
                                    {label}
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.jurisdiction_state ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.jurisdiction_state.message}
                  </p>
                ) : null}
              </Field>

              {selectedJurisdiction ? (
                <Alert>
                  <AlertTitle>Governing law</AlertTitle>
                  <AlertDescription>
                    This draft targets residential landlord–tenant rules for{" "}
                    <strong>{selectedJurisdiction.name}</strong> ({selectedJurisdiction.code}),
                    plus applicable federal overlays (e.g. fair housing; lead-based paint where
                    relevant). City or county ordinances may add requirements — confirm with local
                    counsel.
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Property type</FieldLabel>
                  <Controller
                    control={control}
                    name="property_type"
                    render={({ field }) => (
                      <Select
                        value={field.value === "" ? null : field.value}
                        onValueChange={(v) => field.onChange((v as string) ?? "")}
                      >
                        <SelectTrigger
                          size="default"
                          className="h-10 w-full max-w-none border-input"
                        >
                          <SelectValue placeholder="Select property type (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel>Premises address</FieldLabel>
                <Input
                  placeholder="Street, city, ZIP (optional but recommended)"
                  className={fieldErrorClass(!!errors.premises_address)}
                  aria-invalid={!!errors.premises_address}
                  {...register("premises_address")}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: City and ZIP help align the draft with local rules. We do not auto-detect
                  state from the address — use the state selector above.
                </p>
                {errors.premises_address ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.premises_address.message}
                  </p>
                ) : null}
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>
                    Landlord name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    aria-invalid={!!errors.landlord_name}
                    className={fieldErrorClass(!!errors.landlord_name)}
                    {...register("landlord_name")}
                  />
                  {errors.landlord_name ? (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.landlord_name.message}
                    </p>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>Landlord contact</FieldLabel>
                  <Input
                    placeholder="Phone / email"
                    {...register("landlord_contact")}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>
                    Tenant name(s) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    aria-invalid={!!errors.tenant_names}
                    className={fieldErrorClass(!!errors.tenant_names)}
                    {...register("tenant_names")}
                  />
                  {errors.tenant_names ? (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.tenant_names.message}
                    </p>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>Tenant contact</FieldLabel>
                  <Input placeholder="Phone / email" {...register("tenant_contact")} />
                </Field>
              </div>
            </FieldGroup>

            <FieldGroup className="gap-4">
              <CardTitle className="font-heading text-base">Term & rent</CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>
                    Term type <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="term_type"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as (typeof TERM_TYPE_OPTIONS)[number])}
                      >
                        <SelectTrigger size="default" className="h-10 w-full max-w-none border-input">
                          <SelectValue placeholder="Select term type" />
                        </SelectTrigger>
                        <SelectContent>
                          {TERM_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.term_type ? (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.term_type.message}
                    </p>
                  ) : null}
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>
                    Lease start date <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="lease_start_date"
                    render={({ field }) => (
                      <Popover open={startOpen} onOpenChange={setStartOpen}>
                        <PopoverTrigger
                          type="button"
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-10 w-full justify-start text-left font-normal",
                            fieldErrorClass(!!errors.lease_start_date)
                          )}
                          aria-invalid={!!errors.lease_start_date}
                        >
                          <CalendarIcon className="mr-2 size-4 opacity-60" />
                          {(() => {
                            const d = parseIsoDate(field.value)
                            return d ? format(d, "PPP") : "Pick a date"
                          })()}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={parseIsoDate(field.value)}
                            onSelect={(d) => {
                              if (!d) return
                              const iso = format(d, "yyyy-MM-dd")
                              field.onChange(iso)
                              setValue("lease_end_date", format(addYears(d, 1), "yyyy-MM-dd"))
                              setStartOpen(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.lease_start_date ? (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.lease_start_date.message}
                    </p>
                  ) : null}
                </Field>

                <Field>
                  <FieldLabel>Lease end date</FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Fixed-term defaults to one year after the start date if you clear it. Month-to-month ignores end date.
                  </p>
                  <Controller
                    control={control}
                    name="lease_end_date"
                    render={({ field }) => (
                      <Popover open={endOpen} onOpenChange={setEndOpen}>
                        <PopoverTrigger
                          type="button"
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-10 w-full justify-start text-left font-normal",
                            fieldErrorClass(!!errors.lease_end_date)
                          )}
                          aria-invalid={!!errors.lease_end_date}
                          disabled={termType === "Month-to-month"}
                        >
                          <CalendarIcon className="mr-2 size-4 opacity-60" />
                          {(() => {
                            const d = parseIsoDate(field.value)
                            return d ? format(d, "PPP") : "Pick a date"
                          })()}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={parseIsoDate(field.value)}
                            onSelect={(d) => {
                              if (!d) return
                              field.onChange(format(d, "yyyy-MM-dd"))
                              setEndOpen(false)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.lease_end_date ? (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.lease_end_date.message}
                    </p>
                  ) : null}
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field className="sm:col-span-1">
                  <FieldLabel>
                    Monthly rent <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    placeholder="e.g. 2500 USD"
                    aria-invalid={!!errors.monthly_rent}
                    className={fieldErrorClass(!!errors.monthly_rent)}
                    {...register("monthly_rent")}
                  />
                  {errors.monthly_rent ? (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.monthly_rent.message}
                    </p>
                  ) : null}
                </Field>
                <Field>
                  <FieldLabel>Rent due day</FieldLabel>
                  <Input placeholder="e.g. 1st" {...register("rent_due_day")} />
                </Field>
                <Field>
                  <FieldLabel>Security deposit</FieldLabel>
                  <Controller
                    control={control}
                    name="deposit_mode"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v as (typeof DEPOSIT_MODE_OPTIONS)[number])}
                      >
                        <SelectTrigger size="default" className="h-10 w-full max-w-none border-input">
                          <SelectValue placeholder="Select deposit mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPOSIT_MODE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {depositMode === "Deposit" ? (
                    <Input
                      className="mt-2"
                      placeholder="e.g. 2500 USD"
                      {...register("deposit_amount")}
                    />
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">No deposit will be drafted.</p>
                  )}
                </Field>
              </div>
            </FieldGroup>

            <FieldGroup className="gap-4">
              <CardTitle className="font-heading text-base">Other terms</CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>
                    Payment method <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="payment_method"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) =>
                          field.onChange(v as (typeof PAYMENT_METHOD_OPTIONS)[number])
                        }
                      >
                        <SelectTrigger size="default" className="h-10 w-full max-w-none border-input">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHOD_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel>Payment notes</FieldLabel>
                  <Input placeholder="Optional details (account, address, etc.)" {...register("payment_notes")} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Utilities included (multi-select)</FieldLabel>
                <Controller
                  control={control}
                  name="utilities_multi"
                  render={({ field }) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {UTILITIES_OPTIONS.map((opt) => {
                        const checked = (field.value ?? []).includes(opt)
                        return (
                          <label key={opt} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = new Set(field.value ?? [])
                                if (e.target.checked) next.add(opt)
                                else next.delete(opt)
                                field.onChange(Array.from(next))
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  We’ll summarize this into the lease. You can also add details below.
                </p>
              </Field>
              <Field>
                <FieldLabel>Utilities included</FieldLabel>
                <Input {...register("utilities_included")} />
              </Field>
              <Field>
                <FieldLabel>Pets</FieldLabel>
                <Input {...register("pets_policy")} />
              </Field>
              <Field>
                <FieldLabel>Parking / storage</FieldLabel>
                <Input {...register("parking_storage")} />
              </Field>
              <Field>
                <FieldLabel>Maintenance</FieldLabel>
                <Input {...register("maintenance_resp")} />
              </Field>
              <Field>
                <FieldLabel>Special terms</FieldLabel>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="HOA, Section 8, early termination, etc."
                  {...register("special_terms")}
                />
              </Field>
            </FieldGroup>

            {busy ? (
              <Card className="border-primary/25 bg-primary/5">
                <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                  <Loader2Icon
                    className="size-14 animate-spin text-primary"
                    aria-hidden
                  />
                  <div className="max-w-md space-y-2">
                    <p className="text-base font-medium leading-snug">
                      AI is drafting your customized lease agreement based on{" "}
                      <span className="text-primary">
                        {selectedJurisdiction?.name ?? "your selected state"}
                      </span>{" "}
                      law…
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This usually takes 8–25 seconds. Please wait…
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {STREAM_PHASE_HINTS[streamPhase]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                {busy ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate draft & PDF"
                )}
              </Button>
              {busy ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={cancelGeneration}
                >
                  Cancel generation
                </Button>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={busy}
                onClick={fallbackPdfAction}
              >
                Generate via server action
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Generation uses a single full response from the model for stability; the preview
              below appears when the server finishes — no raw JSON during loading.
            </p>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 border-t">
          <WatermarkUpgradePrompt
            enabled={!!downloadUrl && resultIsPro === false}
            storageKey="accilease_watermark_prompt_generate_v1"
          />
          {resultContract && !busy ? (
            <div className="w-full space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-heading text-lg font-semibold">Your draft</h2>
                {downloadUrl && signReadyMissingFields.length === 0 ? (
                  <a
                    href={downloadUrl}
                    download="accilease-draft.pdf"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "inline-flex w-full justify-center sm:w-auto"
                    )}
                  >
                    Download PDF
                  </a>
                ) : downloadUrl ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    disabled
                  >
                    Fill required fields to download
                  </Button>
                ) : null}
              </div>
              {downloadUrl && signReadyMissingFields.length > 0 ? (
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <AlertTitle className="text-amber-100">Sign-ready PDF requires a few fields</AlertTitle>
                  <AlertDescription className="text-amber-100/90">
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {signReadyMissingFields.map((f) => (
                        <li key={f.id}>{f.label}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs">
                      You can still review the draft below. Fill the missing fields above to enable PDF download.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : null}
              <LeaseDraftPreview contract={resultContract} />
            </div>
          ) : downloadUrl && !resultContract ? (
            <a
              href={downloadUrl}
              download="accilease-draft.pdf"
              className={cn(
                buttonVariants({ variant: "default" }),
                "inline-flex w-full justify-center sm:w-auto"
              )}
            >
              Download PDF
            </a>
          ) : null}
          <p className="hidden" aria-hidden />
        </CardFooter>
      </Card>
    </div>
  )
}
