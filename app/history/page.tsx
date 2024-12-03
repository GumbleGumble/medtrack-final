"use client"

import { ErrorBoundary } from '@/components/error-boundary'
import { HistoryLog } from "@/components/history/history-log"
import { HistoryFilters } from "@/components/history/history-filters"
import { Navigation } from "@/components/navigation"
import { useState, useEffect } from "react"
import { HistoryFilters as HistoryFiltersType, HistoryResponse, MedicationWithDoses } from "@/types/medication"
import { useToast } from "@/components/ui/use-toast"
import { MedicationGroup } from "@prisma/client"

export default function HistoryPage() {
  const [filters, setFilters] = useState<HistoryFiltersType>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    medicationIds: [],
    groupIds: [],
    includeSkipped: true,
    status: 'all',
    timeOfDay: 'all',
    search: '',
    page: 1,
    limit: 10,
    sortField: 'timestamp',
    sortDirection: 'desc',
  })

  const [medications, setMedications] = useState<MedicationWithDoses[]>([])
  const [groups, setGroups] = useState<MedicationGroup[]>([])
  const [historyData, setHistoryData] = useState<HistoryResponse>({
    doses: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
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

  async function fetchGroups() {
    try {
      const response = await fetch('/api/medication-groups')
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
      if (!response.ok) throw new Error('Failed to fetch history')
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto p-4 pb-20">
        <h1 className="text-2xl font-semibold mb-6">Medication History</h1>
        <ErrorBoundary>
          <div className="mb-6">
            <HistoryFilters 
              filters={filters} 
              onFiltersChange={setFilters}
              medications={medications}
              groups={groups}
            />
          </div>
          <ErrorBoundary>
            <HistoryLog 
              data={historyData}
              isLoading={isLoading}
              onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
            />
          </ErrorBoundary>
        </ErrorBoundary>
      </main>
      <Navigation />
    </div>
  )
} 