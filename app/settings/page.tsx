"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Camera } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function SettingsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/sign-in")
        return
      }

      const user = data.user

      setEmail(user.email || "")
      const fullName = user.user_metadata?.full_name || ""
      const parts = fullName.split(" ")
      setFirstName(parts[0] || "")
      setLastName(parts.slice(1).join(" ") || "")
      setAvatar(user.user_metadata?.avatar_url || "")

      setLoading(false)
    }

    loadUser()
  }, [])

  // =========================
  // UPDATE PROFILE
  // =========================
  const handleUpdateInfo = async () => {
    const full_name = `${firstName} ${lastName}`.trim()

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name,
        avatar_url: avatar,
      },
    })

    if (error) {
      alert(error.message)
      return
    }

    setSuccessMessage("Profile updated successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // =========================
  // CHANGE PASSWORD
  // =========================
  const handleChangePassword = async () => {
    setPasswordError("")

    if (!newPassword || !confirmPassword) {
      setPasswordError("All fields are required")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setPasswordError(error.message)
      return
    }

    setShowPasswordDialog(false)
    setNewPassword("")
    setConfirmPassword("")
    setSuccessMessage("Password changed successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  // =========================
  // AVATAR UPLOAD (LOCAL ONLY)
  // =========================
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Settings" />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            <div className="rounded-2xl border bg-card p-4 sm:p-6 lg:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Account Information</h2>
                <button onClick={() => router.back()} className="text-sm underline">
                  Go Back
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {firstName.charAt(0)}
                      {lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    {firstName} {lastName}
                  </h3>
                  <p className="text-muted-foreground">{email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>First Name</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input value={email} disabled />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleUpdateInfo} className="bg-[#FF5A3D]">
                    Update Info
                  </Button>
                  <Button onClick={() => setShowPasswordDialog(true)} className="bg-[#FF5A3D]">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PASSWORD DIALOG */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter a new password</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}

            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} className="bg-[#FF5A3D]">Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
