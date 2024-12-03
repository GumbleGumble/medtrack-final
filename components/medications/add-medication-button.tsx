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
import { Form, FormField, FormSection, FormSubmit } from "@/components/ui/form"
import { z } from "zod"

interface AddMedicationButtonProps {
  onSuccess: () => void
}

const medicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dosage: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Dosage must be a positive number",
  }),
  unit: z.enum(["mg", "ml", "pill"], {
    errorMap: () => ({ message: "Please select a valid unit" }),
  }),
  frequency: z.enum(["daily", "twice_daily", "as_needed", "weekly"], {
    errorMap: () => ({ message: "Please select a valid frequency" }),
  }),
  groupId: z.string().min(1, "Please select a medication group"),
  isAsNeeded: z.coerce.boolean(),
  minTimeBetweenDoses: z.union([
    z.literal(""),
    z.coerce.number().min(0, "Must be 0 or greater"),
  ]).transform((val): number | null => val === "" ? null : val as number),
}) satisfies z.ZodType<{
  name: string
  dosage: string
  unit: "mg" | "ml" | "pill"
  frequency: "daily" | "twice_daily" | "as_needed" | "weekly"
  groupId: string
  isAsNeeded: boolean
  minTimeBetweenDoses: number | null
}>

type MedicationFormData = z.infer<typeof medicationSchema>

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

  async function handleSubmit(data: MedicationFormData) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 422 && errorData.errors) {
          throw new Error(JSON.stringify(errorData.errors))
        }
        throw new Error('Failed to add medication')
      }

      toast({
        title: "Success",
        description: "Medication added successfully",
      })
      setOpen(false)
      onSuccess()
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('{')) {
        try {
          const errors = JSON.parse(error.message) as Record<string, string[]>
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              toast({
                title: "Validation Error",
                description: messages[0],
                variant: "destructive",
              })
            }
          })
        } catch {
          toast({
            title: "Error",
            description: "Failed to add medication",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to add medication",
          variant: "destructive",
        })
      }
      throw error
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
        <Button size="icon" aria-label="Add medication">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
        </DialogHeader>
        <Form
          schema={medicationSchema}
          onSubmit={handleSubmit}
          onError={(error) => {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            })
          }}
        >
          <FormSection>
            <FormField
              name="name"
              label="Medication Name"
              required
              description="Enter the name of the medication"
            >
              <Input placeholder="e.g., Aspirin" />
            </FormField>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="dosage"
                label="Dosage"
                required
                description="Enter the amount per dose"
              >
                <Input type="number" step="0.1" min="0" />
              </FormField>
              
              <FormField
                name="unit"
                label="Unit"
                required
                description="Select the unit of measurement"
              >
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg">mg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="pill">pill(s)</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField
              name="frequency"
              label="Frequency"
              required
              description="How often should this medication be taken?"
            >
              <Select>
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
            </FormField>

            <FormField
              name="groupId"
              label="Group"
              required
              description="Select which group this medication belongs to"
            >
              <Select>
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
            </FormField>

            <FormField
              name="isAsNeeded"
              label="Take as needed"
              description="Enable if this medication is taken only when needed"
            >
              <Switch />
            </FormField>

            <FormField
              name="minTimeBetweenDoses"
              label="Minimum time between doses"
              description="Optional: Set a minimum waiting time between doses (in minutes)"
            >
              <Input
                type="number"
                min="0"
                placeholder="e.g., 240 for 4 hours"
              />
            </FormField>

            <FormSubmit
              disabled={isLoading}
              isSubmitting={isLoading}
              submittingText="Adding Medication..."
              className="w-full"
            >
              Add Medication
            </FormSubmit>
          </FormSection>
        </Form>
      </DialogContent>
    </Dialog>
  )
}