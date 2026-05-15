"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup, type AuthState } from "@/app/actions/auth";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export function SignupForm() {
  const [state, action, isPending] = useActionState<AuthState, FormData>(signup, null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started with CaraCarriers today
        </p>
      </div>

      {/* Domain restriction notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        Registration is restricted to <strong className="text-foreground">@caracarriers.com</strong> email addresses.
      </div>

      {state?.error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="John"
              required
              disabled={isPending}
              className={state?.fieldErrors?.firstName ? "border-destructive" : ""}
            />
            {state?.fieldErrors?.firstName && (
              <p className="text-xs text-destructive">{state.fieldErrors.firstName[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Smith"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company name</Label>
          <Input
            id="company"
            name="company"
            placeholder="CaraCarriers LLC"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="michael@caracarriers.com"
            autoComplete="email"
            required
            disabled={isPending}
            className={state?.fieldErrors?.email ? "border-destructive" : ""}
          />
          {state?.fieldErrors?.email && (
            <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            required
            disabled={isPending}
            className={state?.fieldErrors?.password ? "border-destructive" : ""}
          />
          {state?.fieldErrors?.password && (
            <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
