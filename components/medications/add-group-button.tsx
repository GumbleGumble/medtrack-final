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
import { AddGroupForm } from "./add-group-form"

interface AddGroupButtonProps {
  onSuccess: () => void
}

export function AddGroupButton({ onSuccess }: AddGroupButtonProps) {
  const [open, setOpen] = useState(false)

  function handleSuccess() {
    setOpen(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medication Group</DialogTitle>
        </DialogHeader>
        <AddGroupForm
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}