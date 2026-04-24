"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, Sparkles } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createBrowserClientSupabase } from "@/app/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

const signUpSchema = z
  .object({
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Password is too long."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type SignInValues = z.infer<typeof signInSchema>
type SignUpValues = z.infer<typeof signUpSchema>

function safeRedirectPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard"
  }
  return raw.split("#")[0] ?? "/dashboard"
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectPath(
    searchParams.get("redirectTo") ?? searchParams.get("redirect")
  )

  const mode = searchParams.get("mode")
  const [tab, setTab] = useState<"signin" | "signup">(
    mode === "signup" ? "signup" : "signin"
  )

  const supabase = useMemo(() => createBrowserClientSupabase(), [])

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  async function onSignIn(values: SignInValues) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        if (error.message.includes('fetch failed') || error.message.includes('timeout')) {
          toast.error('Network connection error. Please check your internet connection and try again.')
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success("Signed in successfully.")
      router.push(redirectTo)
      router.refresh()
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again later.')
      console.error('Sign in error:', error)
    }
  }

  async function onSignUp(values: SignUpValues) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (error) {
        if (error.message.includes('fetch failed') || error.message.includes('timeout')) {
          toast.error('Network connection error. Please check your internet connection and try again.')
        } else {
          toast.error(error.message)
        }
        return
      }

      if (data.session) {
        toast.success("Account created. Welcome!")
        router.push(redirectTo)
        router.refresh()
        return
      }

      toast.info(
        "Check your email to confirm your account before signing in.",
        { duration: 6000 }
      )
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again later.')
      console.error('Sign up error:', error)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 px-4 py-12 text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <span className="text-lg">AcciLease AI</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Sign in with email to manage leases and audits.
          </p>
        </div>

        <Card className="border-border/80 shadow-lg shadow-black/20">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-xl">Welcome</CardTitle>
            <CardDescription>
              Sign in with email and password. New landlords can register in
              the second tab.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "signin" | "signup")}
              className="gap-4"
            >
              <TabsList variant="line" className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="flex flex-col gap-4">
                <form
                  className="space-y-4"
                  onSubmit={signInForm.handleSubmit(onSignIn)}
                  noValidate
                >
                  <FieldGroup>
                    <Field data-invalid={!!signInForm.formState.errors.email}>
                      <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={!!signInForm.formState.errors.email}
                        {...signInForm.register("email")}
                      />
                      <FieldError
                        errors={[signInForm.formState.errors.email]}
                      />
                    </Field>
                    <Field data-invalid={!!signInForm.formState.errors.password}>
                      <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                      <Input
                        id="signin-password"
                        type="password"
                        autoComplete="current-password"
                        aria-invalid={!!signInForm.formState.errors.password}
                        {...signInForm.register("password")}
                      />
                      <FieldError
                        errors={[signInForm.formState.errors.password]}
                      />
                    </Field>
                  </FieldGroup>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signInForm.formState.isSubmitting}
                  >
                    {signInForm.formState.isSubmitting ? (
                      <>
                        <Loader2Icon
                          className="size-4 animate-spin"
                          aria-hidden
                        />
                        Signing in…
                      </>
                    ) : (
                      "Sign in with Email"
                    )}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground">
                  No account?{" "}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => setTab("signup")}
                  >
                    Create one
                  </button>
                </p>
              </TabsContent>

              <TabsContent value="signup" className="flex flex-col gap-4">
                <form
                  className="space-y-4"
                  onSubmit={signUpForm.handleSubmit(onSignUp)}
                  noValidate
                >
                  <FieldGroup>
                    <Field data-invalid={!!signUpForm.formState.errors.email}>
                      <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={!!signUpForm.formState.errors.email}
                        {...signUpForm.register("email")}
                      />
                      <FieldError
                        errors={[signUpForm.formState.errors.email]}
                      />
                    </Field>
                    <Field data-invalid={!!signUpForm.formState.errors.password}>
                      <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={!!signUpForm.formState.errors.password}
                        {...signUpForm.register("password")}
                      />
                      <FieldError
                        errors={[signUpForm.formState.errors.password]}
                      />
                    </Field>
                    <Field
                      data-invalid={
                        !!signUpForm.formState.errors.confirmPassword
                      }
                    >
                      <FieldLabel htmlFor="signup-confirm">
                        Confirm password
                      </FieldLabel>
                      <Input
                        id="signup-confirm"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={
                          !!signUpForm.formState.errors.confirmPassword
                        }
                        {...signUpForm.register("confirmPassword")}
                      />
                      <FieldError
                        errors={[signUpForm.formState.errors.confirmPassword]}
                      />
                    </Field>
                  </FieldGroup>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signUpForm.formState.isSubmitting}
                  >
                    {signUpForm.formState.isSubmitting ? (
                      <>
                        <Loader2Icon
                          className="size-4 animate-spin"
                          aria-hidden
                        />
                        Creating account…
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => setTab("signin")}
                  >
                    Sign in instead
                  </button>
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t border-border/60 bg-muted/30 pt-4">
            <div className="hidden" aria-hidden />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" aria-hidden />
        Loading…
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
