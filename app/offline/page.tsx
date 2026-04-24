import Link from "next/link"
import { WifiOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Offline",
  description: "You are offline.",
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <WifiOff className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <CardTitle className="font-heading text-xl">You are offline</CardTitle>
          <CardDescription>
            AcciLease needs a network connection for sign-in, AI generation, and
            audits. Cached pages may still open when you are back online.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button nativeButton={false} render={<Link href="/" />}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
