"use client"

import { useReportWebVitals } from "next/web-vitals"

type WebVitalsMetric = Parameters<typeof useReportWebVitals>[0] extends (m: infer M) => void ? M : never

export function WebVitalsReporter() {
  useReportWebVitals((metric: WebVitalsMetric) => {
    // Fire-and-forget RUM beacon. Server stores in logs (can be forwarded later).
    const body = JSON.stringify(metric)
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", body)
      return
    }
    fetch("/api/vitals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {})
  })

  return null
}

