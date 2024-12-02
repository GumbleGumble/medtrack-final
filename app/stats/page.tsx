"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DoseStats {
  date: string
  taken: number
  skipped: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<DoseStats[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const response = await fetch("/api/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-md mx-auto p-4 pb-20">
        <h1 className="text-2xl font-semibold mb-6">Statistics</h1>
        
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">7-Day Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="taken" fill="hsl(var(--chart-1))" name="Taken" />
                <Bar dataKey="skipped" fill="hsl(var(--chart-2))" name="Skipped" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </main>
      <Navigation />
    </div>
  )
}