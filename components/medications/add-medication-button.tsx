"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { AddMedicationForm } from "./add-medication-form"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface AddMedicationButtonProps {
  onSuccess: () => void
}

export function AddMedicationButton({ onSuccess }: AddMedicationButtonProps) {
  const [open, setOpen] = useState(false)
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    try {
      const response = await fetch('/api/medications/groups')
      if (!response.ok) throw new Error('Failed to fetch groups')
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medication groups",
        variant: "destructive",
      })
    }
  }

  function handleSuccess() {
    setOpen(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
        </DialogHeader>
        <AddMedicationForm
          groups={groups}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}