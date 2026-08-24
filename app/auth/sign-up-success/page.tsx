"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [message, setMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const resendConfirmation = async () => {
    if (!email) return
    setIsSending(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
      },
    })
    setMessage(error ? "Unable to resend the email right now. Please try again later." : "Confirmation email sent.")
    setIsSending(false)
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Confirm your email</CardTitle>
            <CardDescription>Check your inbox before signing in</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to {email ? <strong>{email}</strong> : "your email address"}. You must open it before logging in.
            </p>
            {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
            {email && <Button variant="outline" onClick={resendConfirmation} disabled={isSending}>{isSending ? "Sending..." : "Resend confirmation email"}</Button>}
            <Button asChild><Link href="/auth/login">Go to Login</Link></Button>
            <Button variant="ghost" asChild><Link href="/">Back to Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
