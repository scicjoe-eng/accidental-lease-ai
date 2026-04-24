"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ProgressProps = React.ComponentProps<"div"> & {
  value?: number
  max?: number
  /** When true, shows an indeterminate animation instead of `value`. */
  indeterminate?: boolean
}

function Progress({
  className,
  value,
  max = 100,
  indeterminate = false,
  ...props
}: ProgressProps) {
  const v = value ?? 0
  const pct = indeterminate
    ? undefined
    : Math.min(100, Math.max(0, (v / max) * 100))

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={indeterminate ? undefined : v}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-[width] duration-300 ease-out",
          indeterminate && "w-2/5 min-w-[28%] animate-pulse"
        )}
        style={
          indeterminate
            ? undefined
            : { width: pct !== undefined ? `${pct}%` : undefined }
        }
      />
    </div>
  )
}

export { Progress, type ProgressProps }
