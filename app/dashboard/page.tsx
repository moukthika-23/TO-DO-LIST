"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Plus } from "lucide-react"

import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { TaskCard } from "@/components/task-card"
import { CompletedTaskCard } from "@/components/completed-task-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AddTaskDialog, EditTaskDialog } from "@/components/dialog-components"

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js"

function ensureRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { Razorpay?: new (options: object) => { open: () => void } }
    if (typeof w.Razorpay === "function") {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT}"]`)
    if (existing) {
      const deadline = Date.now() + 15_000
      const tick = () => {
        if (typeof w.Razorpay === "function") {
          resolve()
          return
        }
        if (Date.now() > deadline) {
          reject(new Error("Razorpay script did not become ready in time"))
          return
        }
        requestAnimationFrame(tick)
      }
      tick()
      return
    }
    const script = document.createElement("script")
    script.src = RAZORPAY_SCRIPT
    script.async = true
    script.onload = () => {
      if (typeof w.Razorpay === "function") resolve()
      else reject(new Error("Razorpay global missing after load"))
    }
    script.onerror = () => reject(new Error("Failed to load Razorpay script"))
    document.body.appendChild(script)
  })
}

export interface Task {
  id: string
  title: string
  description: string
  priority: "Extreme" | "Moderate" | "Low"
  status: "Not Started" | "In Progress" | "Completed"
  date: string
  image?: string
  created_at: string
  user_id: string
}

async function ensureProfile(user: any) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!data) {
    await supabase.from("profiles").insert([
      {
        id: user.id,
        is_premium: false,
      },
    ]);
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState("")
  const [showAddTask, setShowAddTask] = useState(false)
  const [showEditTask, setShowEditTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/sign-in")
        return
      }

      setUser(data.user)
      await ensureProfile(data.user)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single()
      setProfile(profileData)
      await loadTasks()
      setLoading(false)
    }

    init()
  }, [])

  const loadTasks = async () => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    try {
      const res = await fetch(`/api/tasks?userId=${auth.user.id}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setTasks(data)
      } else {
        console.error("API returned error instead of tasks:", data)
        setTasks([])
      }
    } catch (error) {
      console.error("Load tasks error:", error)
    }
  }

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id)
    await fetch("/api/tasks/clear-cache", { method: "POST", body: JSON.stringify({ userId: user?.id }) })
    loadTasks()
  }

  const markCompleted = async (id: string) => {
    await supabase.from("tasks").update({ status: "Completed" }).eq("id", id)
    await fetch("/api/tasks/clear-cache", { method: "POST", body: JSON.stringify({ userId: user?.id }) })
    loadTasks()
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setShowEditTask(true)
  }
  const handlePayment = async () => {
    try {
      await ensureRazorpay()
    } catch {
      alert("Could not load payment. Check your connection and try again.")
      return
    }

    const res = await fetch("/api/create-order", {
      method: "POST",
    })

    const data = await res.json()

    const Razorpay = (window as unknown as { Razorpay: new (options: object) => { open: () => void } })
      .Razorpay

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: data.amount,
      currency: "INR",
      name: "ToDo Premium",
      description: "Unlock premium features",
      order_id: data.id,

      handler: async function () {
        alert("Payment Successful!")

        await supabase.from("profiles").update({ is_premium: true }).eq("id", user.id)
        setProfile({ is_premium: true })
        alert("You are now Premium 🚀")
      },
    }

    const rzp = new Razorpay(options)
    rzp.open()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return
    await deleteTask(id)
  }

  const handleFinish = async (id: string) => {
    await markCompleted(id)
  }

const filteredTasks = tasks.filter(
  (t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
)

const pending = filteredTasks.filter((t) => t.status !== "Completed")
const completed = filteredTasks.filter((t) => t.status === "Completed")
const inProgress = filteredTasks.filter((t) => t.status === "In Progress")
const notStarted = filteredTasks.filter((t) => t.status === "Not Started")

  const total = tasks.length || 1

  if (loading) return <div className="p-10 text-center">Loading...</div>

  const fullName = user?.user_metadata?.full_name || "User"
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""

  return (
    <>
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AppHeader
  search={search}
  setSearch={setSearch}
  onBellClick={() => alert("🔔 No notifications yet")}
  onCalendarClick={() => alert("📅 Calendar feature coming soon")}
/>



        <main className="flex-1 p-6 space-y-6">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {fullName} 👋
              </h2>
              <p className="text-muted-foreground mt-1">Here is your task overview for today.</p>
              {profile?.is_premium && (
                <span className="inline-block mt-2 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
                  Premium Member
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {!profile?.is_premium && (
                <Button 
                  onClick={handlePayment} 
                  className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold shadow-md border border-yellow-300"
                >
                  ⭐ Upgrade to Premium (Rs. 1)
                </Button>
              )}
              <Button onClick={() => setShowAddTask(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> New Task
              </Button>
              <Avatar className="border-2 border-primary/20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground">{fullName[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Completed Tasks</h4>
              <div className="text-3xl font-bold text-green-600">{Math.round((completed.length / total) * 100)}%</div>
              <p className="text-xs text-muted-foreground mt-1">{completed.length} of {total} tasks</p>
            </div>
            
            <div className="bg-white dark:bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">In Progress</h4>
              <div className="text-3xl font-bold text-blue-600">{Math.round((inProgress.length / total) * 100)}%</div>
              <p className="text-xs text-muted-foreground mt-1">{inProgress.length} tasks</p>
            </div>

            <div className="bg-white dark:bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Not Started</h4>
                <div className="text-3xl font-bold text-red-500">{Math.round((notStarted.length / total) * 100)}%</div>
              </div>
              <div className="mt-2 text-right">
                <p className="text-xs text-muted-foreground mt-1 text-left">{notStarted.length} tasks</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* LEFT: TO DO */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
                  Active Tasks
                </h3>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">{pending.length}</span>
              </div>

              {pending.length === 0 && (
                <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">All caught up! No active tasks.</p>
                </div>
              )}

              <div className="space-y-3">
                {pending.map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description || ""}
                    priority={task.priority}
                    status={task.status}
                    image={task.image}
                    createdDate={task.date}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => handleDelete(task.id)}
                    onFinish={() => handleFinish(task.id)}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT: COMPLETED */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-2 h-6 bg-green-500 rounded-full inline-block"></span>
                  Completed
                </h3>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">{completed.length}</span>
              </div>

              {completed.length === 0 && (
                <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">No completed tasks yet.</p>
                </div>
              )}

              <div className="space-y-3">
                {completed.map((task) => (
                  <CompletedTaskCard
                    key={task.id}
                    title={task.title}
                    description={task.description}
                    image={task.image || "/placeholder.svg"}
                    completedDate={task.date}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <AddTaskDialog
        open={showAddTask}
        onSuccess={loadTasks}
        onOpenChange={(v) => {
          setShowAddTask(v)
          loadTasks()
        }}
      />

      {editingTask && (
        <EditTaskDialog
          open={showEditTask}
          onSuccess={loadTasks}
          onOpenChange={(v) => {
            setShowEditTask(v)
            loadTasks()
          }}
          task={editingTask}
        />
      )}
    </div>
    </>
  )
}
