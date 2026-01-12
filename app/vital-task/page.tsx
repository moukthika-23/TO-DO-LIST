"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { TaskCard } from "@/components/task-card"

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

export default function VitalTaskPage() {
  const router = useRouter()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: auth } = await supabase.auth.getUser()

      if (!auth.user) {
        router.push("/sign-in")
        return
      }

      await loadTasks(auth.user.id)
      setLoading(false)
    }

    init()
  }, [])

  const loadTasks = async (userId: string) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setTasks((data || []) as Task[])
  }

  // 🔥 Vital = Extreme OR In Progress
  const vitalTasks = tasks.filter(
    (task) => task.priority === "Extreme" || task.status === "In Progress"
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    await supabase.from("tasks").delete().eq("id", id)

    const { data: auth } = await supabase.auth.getUser()
    if (auth.user) {
      loadTasks(auth.user.id)
    }
  }

  const handleFinish = async (id: string) => {
    await supabase.from("tasks").update({ status: "Completed" }).eq("id", id)

    const { data: auth } = await supabase.auth.getUser()
    if (auth.user) {
      loadTasks(auth.user.id)
    }
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Vital Task" />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            Vital Tasks
          </h2>

          {vitalTasks.length === 0 ? (
            <p className="text-muted-foreground">
              No vital tasks at the moment. Tasks with Extreme priority or In Progress status will appear here.
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {vitalTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  description={task.description || ""}
                  priority={task.priority}
                  status={task.status}
                  image={task.image}
                  createdDate={task.date}
                  onDelete={() => handleDelete(task.id)}
                  onFinish={() => handleFinish(task.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
