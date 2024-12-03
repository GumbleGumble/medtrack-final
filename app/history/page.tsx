"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { HistoryLog } from "@/components/history/history-log"
import { HistoryFilters } from "@/components/history/history-filters"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"
import { format } from "date-fns"
import { MedicationWithDoses, HistoryResponse } from "@/types/medication"

export default function HistoryPage() {
  const [medications, setMedications] = useState<MedicationWithDoses[]>([])
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
  const [historyData, setHistoryData] = useState<HistoryResponse>({
    doses: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    medicationIds: [] as string[],
    groupIds: [] as string[],
    includeSkipped: true,
    status: 'all' as 'taken' | 'skipped' | 'all',
    timeOfDay: 'all' as 'morning' | 'afternoon' | 'evening' | 'night' | 'all',
    search: '',
    page: 1,
    limit: 10,
    sortField: 'timestamp',
    sortDirection: 'desc' as 'asc' | 'desc',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchMedications()
    fetchGroups()
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [filters])

  async function fetchMedications() {
    try {
      const response = await fetch('/api/medications')
      if (!response.ok) throw new Error("Failed to fetch medications")
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

  async function fetchGroups() {
    try {
      const response = await fetch('/api/medication-groups')
      if (!response.ok) throw new Error("Failed to fetch groups")
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

  async function fetchHistory() {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        medicationIds: filters.medicationIds.join(","),
        groupIds: filters.groupIds.join(","),
        status: filters.status,
        timeOfDay: filters.timeOfDay,
        search: filters.search,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sortField: filters.sortField,
        sortDirection: filters.sortDirection,
      })

      const response = await fetch(`/api/history?${queryParams}`)
      if (!response.ok) throw new Error("Failed to fetch history")
      const data = await response.json()
      setHistoryData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medication history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleExport() {
    try {
      const response = await fetch("/api/history/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      })

      if (!response.ok) throw new Error("Failed to export history")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `medication-history-${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "History exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export history",
        variant: "destructive",
      })
    }
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }))
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Medication History</h1>
          <Button onClick={handleExport} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <HistoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          medications={medications}
          groups={groups}
        />

        <div className="mt-6">
          <HistoryLog
            data={historyData}
            isLoading={isLoading}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
      <Navigation />
    </div>
  )
} 