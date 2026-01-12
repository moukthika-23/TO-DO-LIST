"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Lock } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // Ensure user session is loaded from reset link
  useEffect(() => {
    supabase.auth.getSession()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setMessage("Password updated successfully! Redirecting to sign in...")
      setTimeout(() => {
        router.push("/sign-in")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FF7B6B] p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* Left Side Illustration */}
        <div className="hidden md:flex items-center justify-center bg-[#FF7B6B] p-12">
          <Image
            src="/images/login.png"
            alt="Reset password"
            width={500}
            height={600}
            className="object-contain"
            priority
          />
        </div>

        {/* Right Side Form */}
        <div className="flex flex-col justify-center p-12 bg-white">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Enter your new password below
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {message}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* New Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-white border-2 border-border rounded-xl"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-14 bg-white border-2 border-border rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-base font-semibold rounded-xl"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>

            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
