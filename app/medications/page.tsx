"use client"

import { useEffect, useState } from "react"
import { ErrorBoundary } from '@/components/error-boundary'
import { MedicationList } from "@/components/medications/medication-list"
import { AddMedicationButton } from "@/components/medications/add-medication-button"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/components/ui/use-toast"
import { MedicationGroupWithMeds } from "@/types/medication"

export default function MedicationsPage() {
  const [groups, setGroups] = useState<MedicationGroupWithMeds[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchMedicationGroups()
  }, [])

  async function fetchMedicationGroups() {
    try {
      const response = await fetch('/api/medications/groups')
      if (!response.ok) throw new Error('Failed to fetch medication groups')
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medications",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-md mx-auto p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Medications</h1>
          <AddMedicationButton onSuccess={fetchMedicationGroups} />
        </div>
        <ErrorBoundary>
          <MedicationList groups={groups} onUpdate={fetchMedicationGroups} />
        </ErrorBoundary>
      </main>
      <Navigation />
    </div>
  )
}