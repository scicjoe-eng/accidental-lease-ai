"use client"

import { ThemeProvider } from "next-themes"

import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster richColors position="top-center" closeButton />
      <PwaInstallPrompt />
    </ThemeProvider>
  )
}
