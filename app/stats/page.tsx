"use client"

import { useEffect, useState } from "react"
import { StatsDashboard } from "@/components/stats/stats-dashboard"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/components/ui/use-toast"
import { MedicationWithDoses } from "@/types/medication"

export default function StatsPage() {
  const [medications, setMedications] = useState<MedicationWithDoses[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchMedications()
  }, [])

  async function fetchMedications() {
    try {
      const response = await fetch('/api/medications')
      if (!response.ok) throw new Error('Failed to fetch medications')
      const data = await response.json()
      setMedications(data)
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
      <main className="container max-w-4xl mx-auto p-4 pb-20">
        <StatsDashboard medications={medications} />
      </main>
      <Navigation />
    </div>
  )
}