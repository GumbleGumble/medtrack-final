"use client"

import { useState } from "react"
import { MedicationWithDoses } from "@/types/medication"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { formatLastTaken } from "@/lib/utils/date"

interface MedicationItemProps {
  medication: MedicationWithDoses
  onUpdate: () => void
}

export function MedicationItem({ medication, onUpdate }: MedicationItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleTakeDose() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/medications/dose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medication.id,
          timestamp: new Date(),
          skipped: false,
        }),
      })

      if (!response.ok) throw new Error('Failed to record dose')
      
      toast({
        title: "Success",
        description: "Dose recorded successfully",
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record dose",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const lastTaken = formatLastTaken(medication.lastTakenAt ? new Date(medication.lastTakenAt) : null)

  return (
    <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
      <div>
        <h4 className="font-medium">{medication.name}</h4>
        <p className="text-sm text-muted-foreground">
          {medication.dosage} {medication.unit} - {medication.isAsNeeded ? 'As needed' : medication.frequency}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Last taken: {lastTaken}
        </p>
      </div>
      <Button
        onClick={handleTakeDose}
        disabled={isLoading}
        className="px-4 py-1.5"
      >
        Take
      </Button>
    </div>
  )
}