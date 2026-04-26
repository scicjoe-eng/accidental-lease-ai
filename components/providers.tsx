"use client"

import { ThemeProvider } from "next-themes"
import dynamic from "next/dynamic"

const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), {
  ssr: false,
})
const PwaInstallPrompt = dynamic(
  () => import("@/components/pwa-install-prompt").then((m) => m.PwaInstallPrompt),
  { ssr: false }
)

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
