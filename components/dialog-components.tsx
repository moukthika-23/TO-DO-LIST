"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface Task {
  id: string
  title: string
  description: string
  priority: "Extreme" | "Moderate" | "Low"
  status: "Not Started" | "In Progress" | "Completed"
  date: string
  image?: string
}

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddTaskDialog({ open, onOpenChange ,onSuccess}: AddTaskDialogProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Moderate" as "Extreme" | "Moderate" | "Low",
    status: "Not Started" as "Not Started" | "In Progress" | "Completed",
    date: "",
    image: "",
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return alert("Not logged in")

    await supabase.from("tasks").insert({
      user_id: auth.user.id,
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      date: form.date,
      image: form.image,
    })

    onOpenChange(false)
    onSuccess()

  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <select className="border p-2 w-full" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
            <option>Extreme</option>
            <option>Moderate</option>
            <option>Low</option>
          </select>

          <select className="border p-2 w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  onSuccess: () => void
}

export function EditTaskDialog({ open, onOpenChange, task , onSuccess }: EditTaskDialogProps) {
  const [form, setForm] = useState<Task>(task)

  // 🔥 IMPORTANT: update form when new task is selected
  useEffect(() => {
    setForm(task)
  }, [task])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    await supabase
      .from("tasks")
      .update({
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        date: form.date,
        image: form.image,
      })
      .eq("id", task.id)

    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Image URL" value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <select className="border p-2 w-full" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}>
            <option>Extreme</option>
            <option>Moderate</option>
            <option>Low</option>
          </select>

          <select className="border p-2 w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <Button type="submit">Update</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
