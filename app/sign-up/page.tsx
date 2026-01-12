"use client"

import { User, Mail, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password) {
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
          username: formData.username,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* Left Illustration */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-12">
          <Image src="/images/signup.png" alt="Sign up" width={400} height={600} className="object-contain" />
        </div>

        {/* Right Form */}
        <div className="flex flex-col justify-center p-12 bg-white">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-4xl font-bold mb-8">Sign Up</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>

              <Input placeholder="First Name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              <Input placeholder="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              <Input placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <Input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              <Input type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />

              <div className="flex items-center space-x-2">
                <Checkbox checked={agreedToTerms} onCheckedChange={(v) => setAgreedToTerms(Boolean(v))} />
                <span className="text-sm">I agree to all terms</span>
              </div>

              <Button disabled={loading} type="submit" className="w-full">
                {loading ? "Creating..." : "Register"}
              </Button>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-blue-600 hover:underline">
                  Sign In
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
