"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2 } from "lucide-react"

import { supabase } from "@/lib/supabaseClient"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { TaskCard } from "@/components/task-card"
import { Button } from "@/components/ui/button"

// ✅ Task type
interface Task {
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

export default function MyTaskPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
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
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Load tasks error:", error)
      return
    }

    const list = (data || []) as Task[]
    setTasks(list)

    if (list.length > 0) {
      setSelectedTask(list[0])
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    await supabase.from("tasks").delete().eq("id", id)

    const { data: auth } = await supabase.auth.getUser()
    if (auth.user) {
      await loadTasks(auth.user.id)
    }
  }

  const handleFinish = async (id: string) => {
    await supabase.from("tasks").update({ status: "Completed" }).eq("id", id)

    const { data: auth } = await supabase.auth.getUser()
    if (auth.user) {
      await loadTasks(auth.user.id)
    }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="My Task" />

        <main className="flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr,500px] min-h-full">

            {/* LEFT LIST */}
            <div className="p-6 border-r overflow-y-auto">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">My Tasks</h2>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-sm underline"
                >
                  Go Back
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No tasks available. Go to Dashboard to add tasks!
                </p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`cursor-pointer ${
                        selectedTask?.id === task.id ? "ring-2 ring-primary rounded-xl" : ""
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <TaskCard
                        title={task.title}
                        description={task.description || ""}
                        priority={task.priority}
                        status={task.status}
                        image={task.image}
                        createdDate={task.date}
                        onDelete={() => handleDelete(task.id)}
                        onFinish={() => handleFinish(task.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT DETAILS */}
            {selectedTask ? (
              <div className="p-6 bg-muted/20 overflow-y-auto">
                <div className="bg-white rounded-xl p-6">

                  {selectedTask.image && (
                    <Image
                      src={selectedTask.image}
                      alt={selectedTask.title}
                      width={400}
                      height={250}
                      className="w-full rounded-lg mb-4"
                    />
                  )}

                  <h2 className="text-2xl font-bold mb-4">{selectedTask.title}</h2>

                  <div className="space-y-2 mb-4 text-sm">
                    <p>Priority: <b>{selectedTask.priority}</b></p>
                    <p>Status: <b>{selectedTask.status}</b></p>
                    <p>Created on: {selectedTask.date}</p>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    {selectedTask.description || "No description"}
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedTask.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center">
                <p className="text-muted-foreground">Select a task</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
