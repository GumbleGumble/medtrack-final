"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { MedicationGroupWithMeds } from "@/types/medication"

interface AddMedicationButtonProps {
  onSuccess: () => void
}

export function AddMedicationButton({ onSuccess }: AddMedicationButtonProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<MedicationGroupWithMeds[]>([])
  const { toast } = useToast()

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const medicationData = {
      name: formData.get("name"),
      dosage: formData.get("dosage"),
      unit: formData.get("unit"),
      frequency: formData.get("frequency"),
      groupId: formData.get("groupId"),
      isAsNeeded: formData.get("isAsNeeded") === "on",
      minTimeBetweenDoses: formData.get("minTimeBetweenDoses") 
        ? parseInt(formData.get("minTimeBetweenDoses") as string) 
        : null,
    }

    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicationData),
      })

      if (!response.ok) throw new Error('Failed to add medication')

      toast({
        title: "Success",
        description: "Medication added successfully",
      })
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add medication",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (isOpen) fetchGroups()
    }}>
      <DialogTrigger asChild>
        <Button size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medication Name</Label>
            <Input id="name" name="name" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" name="dosage" type="number" step="0.1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select name="unit" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">mg</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="pill">pill(s)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select name="frequency" required>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="twice_daily">Twice Daily</SelectItem>
                <SelectItem value="as_needed">As Needed</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupId">Group</Label>
            <Select name="groupId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isAsNeeded">Take as needed</Label>
            <Switch id="isAsNeeded" name="isAsNeeded" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minTimeBetweenDoses">
              Minimum time between doses (minutes)
            </Label>
            <Input
              id="minTimeBetweenDoses"
              name="minTimeBetweenDoses"
              type="number"
              min="0"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Medication"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}