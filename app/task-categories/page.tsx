"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

interface Item {
  id: string
  name: string
}

export default function TaskCategoriesPage() {
  const router = useRouter()

  const [statuses, setStatuses] = useState<Item[]>([])
  const [priorities, setPriorities] = useState<Item[]>([])

  const [statusName, setStatusName] = useState("")
  const [priorityName, setPriorityName] = useState("")

  const [showAddStatus, setShowAddStatus] = useState(false)
  const [showEditStatus, setShowEditStatus] = useState(false)
  const [showAddPriority, setShowAddPriority] = useState(false)
  const [showEditPriority, setShowEditPriority] = useState(false)

  const [editingStatus, setEditingStatus] = useState<Item | null>(null)
  const [editingPriority, setEditingPriority] = useState<Item | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/sign-in")
        return
      }
      loadAll()
    }
    init()
  }, [])

  const loadAll = async () => {
    const { data: s } = await supabase.from("task_statuses").select("*").order("created_at")
    const { data: p } = await supabase.from("task_priorities").select("*").order("created_at")
    setStatuses(s || [])
    setPriorities(p || [])
  }

  // -------- STATUS ----------
  const addStatus = async () => {
    if (!statusName.trim()) return
    await supabase.from("task_statuses").insert({ name: statusName })
    setStatusName("")
    setShowAddStatus(false)
    loadAll()
  }

  const updateStatus = async () => {
    if (!editingStatus) return
    await supabase.from("task_statuses").update({ name: statusName }).eq("id", editingStatus.id)
    setEditingStatus(null)
    setShowEditStatus(false)
    loadAll()
  }

  const deleteStatus = async (id: string) => {
    if (!confirm("Delete this status?")) return
    await supabase.from("task_statuses").delete().eq("id", id)
    loadAll()
  }

  // -------- PRIORITY ----------
  const addPriority = async () => {
    if (!priorityName.trim()) return
    await supabase.from("task_priorities").insert({ name: priorityName })
    setPriorityName("")
    setShowAddPriority(false)
    loadAll()
  }

  const updatePriority = async () => {
    if (!editingPriority) return
    await supabase.from("task_priorities").update({ name: priorityName }).eq("id", editingPriority.id)
    setEditingPriority(null)
    setShowEditPriority(false)
    loadAll()
  }

  const deletePriority = async (id: string) => {
    if (!confirm("Delete this priority?")) return
    await supabase.from("task_priorities").delete().eq("id", id)
    loadAll()
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Task Categories" />

        <main className="flex-1 overflow-y-auto p-6 space-y-8 max-w-5xl">

          {/* STATUS */}
          <div className="border rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-bold">Task Status</h2>
              <button onClick={() => router.back()} className="underline text-sm">Go Back</button>
            </div>

            {statuses.map((s, i) => (
              <div key={s.id} className="flex justify-between border-b py-2">
                <div>{i + 1}. {s.name}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingStatus(s)
                    setStatusName(s.name)
                    setShowEditStatus(true)
                  }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteStatus(s.id)}>Delete</Button>
                </div>
              </div>
            ))}

            <Button className="mt-4" onClick={() => setShowAddStatus(true)}>+ Add New Status</Button>
          </div>

          {/* PRIORITY */}
          <div className="border rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Task Priority</h2>

            {priorities.map((p, i) => (
              <div key={p.id} className="flex justify-between border-b py-2">
                <div>{i + 1}. {p.name}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingPriority(p)
                    setPriorityName(p.name)
                    setShowEditPriority(true)
                  }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePriority(p.id)}>Delete</Button>
                </div>
              </div>
            ))}

            <Button className="mt-4" onClick={() => setShowAddPriority(true)}>+ Add New Priority</Button>
          </div>

        </main>
      </div>

      {/* Dialogs */}
      <Dialog open={showAddStatus} onOpenChange={setShowAddStatus}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Status</DialogTitle></DialogHeader>
          <Input value={statusName} onChange={(e) => setStatusName(e.target.value)} />
          <Button onClick={addStatus}>Add</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditStatus} onOpenChange={setShowEditStatus}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Status</DialogTitle></DialogHeader>
          <Input value={statusName} onChange={(e) => setStatusName(e.target.value)} />
          <Button onClick={updateStatus}>Update</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddPriority} onOpenChange={setShowAddPriority}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Priority</DialogTitle></DialogHeader>
          <Input value={priorityName} onChange={(e) => setPriorityName(e.target.value)} />
          <Button onClick={addPriority}>Add</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditPriority} onOpenChange={setShowEditPriority}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Priority</DialogTitle></DialogHeader>
          <Input value={priorityName} onChange={(e) => setPriorityName(e.target.value)} />
          <Button onClick={updatePriority}>Update</Button>
        </DialogContent>
      </Dialog>

    </div>
  )
}
