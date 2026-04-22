"use client"

import { User, Mail, Lock } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function SignUpPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms")
      return
    }

    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: `${formData.firstName} ${formData.lastName}`,
          
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    alert("Account created! Now sign in.")
    router.push("/sign-in")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="text-center mb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join us to manage your tasks effectively</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">First Name</label>
              <Input 
                placeholder="John" 
                value={formData.firstName} 
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                className="h-11 bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Last Name</label>
              <Input 
                placeholder="Doe" 
                value={formData.lastName} 
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                className="h-11 bg-background"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="john@example.com" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="pl-9 h-11 bg-background"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-9 pr-14 h-11 bg-background"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="pl-9 pr-14 h-11 bg-background"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(v) => setAgreedToTerms(Boolean(v))} />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              I agree to the Terms & Conditions
            </label>
          </div>

          <Button disabled={loading} type="submit" className="w-full h-12 font-bold mt-2">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-sm text-center text-muted-foreground pt-4">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
