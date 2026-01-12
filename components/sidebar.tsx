"use client"

import {
  LayoutDashboard,
  AlertCircle,
  CheckSquare,
  List,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vital Task", href: "/vital-task", icon: AlertCircle },
  { name: "My Task", href: "/my-task", icon: CheckSquare },
  { name: "Task Categories", href: "/task-categories", icon: List },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
]

type UserInfo = {
  name: string
  email: string
  avatar: string
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/sign-in")
        return
      }

      const meta = data.user.user_metadata || {}

      setUser({
        name:
          meta.full_name ||
          meta.name ||
          data.user.email?.split("@")[0] ||
          "User",
        email: data.user.email || "",
        avatar: meta.avatar_url || meta.picture || "",
      })
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  // 🔁 While loading user
  if (!user) {
    return (
      <div className="flex h-screen w-[280px] items-center justify-center bg-primary text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-screen w-[280px] flex-col bg-primary text-primary-foreground">
      {/* User Profile */}
      <div className="flex flex-col items-center gap-3 border-b border-primary-foreground/20 p-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatar || ""} alt={user.name} />
          <AvatarFallback className="bg-primary-foreground text-primary text-2xl">
            {user.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="font-semibold text-lg">{user.name}</h2>
          <p className="text-sm text-primary-foreground/80">{user.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-primary-foreground/90 hover:bg-primary-foreground/10",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary-foreground/90 transition-colors hover:bg-primary-foreground/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
