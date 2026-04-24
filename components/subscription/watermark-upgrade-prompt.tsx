"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

import { UPGRADE_RELATIVE_PATH } from "@/app/lib/site-paths"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type WatermarkUpgradePromptProps = {
  /** Only show when user is free and a PDF was successfully generated. */
  enabled: boolean
  /**
   * Storage key to ensure "show once" behavior.
   * Use different keys if you want separate prompts per flow.
   */
  storageKey?: string
  className?: string
}

export function WatermarkUpgradePrompt({
  enabled,
  storageKey = "accilease_watermark_upgrade_prompt_v1",
  className,
}: WatermarkUpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false)

  const hasSeen = useMemo(() => {
    if (!enabled) return true
    try {
      return window.localStorage.getItem(storageKey) != null
    } catch {
      return false
    }
  }, [enabled, storageKey])

  const shouldRender = enabled && !dismissed && !hasSeen

  useEffect(() => {
    if (!shouldRender) return
    try {
      window.localStorage.setItem(storageKey, "1")
    } catch {
      // ignore
    }
  }, [shouldRender, storageKey])

  if (!shouldRender) return null

  return (
    <Card
      className={cn(
        "border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-sm",
        className
      )}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <Sparkles className="size-4 text-amber-500" aria-hidden />
          Remove watermark with Pro
        </CardTitle>
        <CardDescription className="text-sm">
          <span>
            Your PDF includes an AI-generated watermark. Unlock Pro ($8.99 one-time purchase on Gumroad),
            redeem your license key on the upgrade page, and your next full PDF delivery can be watermark-free.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          <span>Tip: Upgrade once, then regenerate the PDF for a clean version.</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
          >
            Not now
          </Button>
          <Button
            size="sm"
            className="bg-amber-500 text-amber-950 hover:bg-amber-500/90"
            nativeButton={false}
            render={<Link href={UPGRADE_RELATIVE_PATH} />}
          >
            Upgrade Pro to Remove Watermark
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

