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

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Load tasks error:", error)
      return
    }

    setTasks((data || []) as Task[])
  }

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id)
    loadTasks()
  }

  const markCompleted = async (id: string) => {
    await supabase.from("tasks").update({ status: "Completed" }).eq("id", id)
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
          <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">
  Welcome, {fullName} 👋
</h2>

{profile?.is_premium && (
  <span className="text-yellow-500 font-semibold">
    👑 Premium User
  </span>
)}

  <div className="flex items-center gap-3">
    {/* 🔥 ADD THIS BUTTON */}
    <Button
  onClick={handlePayment}
  disabled={profile?.is_premium}
  className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-semibold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
>
  <span className="absolute inset-0 bg-white opacity-20 blur-xl animate-pulse"></span>

  <span className="relative flex items-center gap-2">
    {profile?.is_premium ? "👑 Premium Activated" : "⚡ Upgrade ₹1"}
  </span>
</Button>

    <Avatar>
      <AvatarImage src={avatarUrl} />
      <AvatarFallback>{fullName[0]}</AvatarFallback>
    </Avatar>
  </div>
</div>


          <div className="grid lg:grid-cols-[1fr,400px] gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              <div className="border rounded-xl p-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-semibold">To Do</h3>
                  <Button onClick={() => setShowAddTask(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </div>

                {pending.length === 0 && (
                  <p className="text-muted-foreground text-center py-6">
                    No tasks yet. Click "Add Task".
                  </p>
                )}

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

              {completed.length > 0 && (
                <div className="border rounded-xl p-4">
                  <h3 className="text-xl font-semibold mb-4">Completed</h3>
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
              )}
            </div>

            {/* RIGHT */}
            <div className="border rounded-xl p-6 space-y-6 text-center">
              <h3 className="text-xl font-semibold">Task Stats</h3>
              <div>Completed: {Math.round((completed.length / total) * 100)}%</div>
              <div>In Progress: {Math.round((inProgress.length / total) * 100)}%</div>
              <div>Not Started: {Math.round((notStarted.length / total) * 100)}%</div>
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
