"use client"

import { useCallback, useEffect, useState } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/**
 * Shows an install banner when the browser fires `beforeinstallprompt` (Chromium).
 * iOS Safari does not support this event; users can use Share → Add to Home Screen.
 */
export function PwaInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEventLike | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as BeforeInstallPromptEventLike)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    return () => window.removeEventListener("beforeinstallprompt", onPrompt)
  }, [])

  const onInstall = useCallback(async () => {
    if (!event) return
    await event.prompt()
    await event.userChoice
    setEvent(null)
  }, [event])

  if (!event || dismissed) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md",
        "supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]"
      )}
      role="region"
      aria-label="Install app"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Install AcciLease</span>{" "}
          for quick access from your home screen.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            Not now
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => void onInstall()}>
            <Download className="size-4" aria-hidden />
            Install
          </Button>
        </div>
      </div>
    </div>
  )
}
