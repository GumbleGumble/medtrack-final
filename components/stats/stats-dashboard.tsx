"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { startOfWeek, endOfWeek, format, addDays } from "date-fns"
import { MedicationWithDoses } from "@/types/medication"

interface StatsProps {
  medications: MedicationWithDoses[]
}

export function StatsDashboard({ medications }: StatsProps) {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week")
  const [adherenceData, setAdherenceData] = useState<any[]>([])

  useEffect(() => {
    calculateAdherenceData()
  }, [timeframe, medications])

  function calculateAdherenceData() {
    const startDate = startOfWeek(new Date())
    const endDate = endOfWeek(new Date())
    const days = []
    let currentDate = startDate

    while (currentDate <= endDate) {
      const dayData = {
        date: format(currentDate, "MM/dd"),
        adherence: calculateDailyAdherence(currentDate),
      }
      days.push(dayData)
      currentDate = addDays(currentDate, 1)
    }

    setAdherenceData(days)
  }

  function calculateDailyAdherence(date: Date) {
    const totalMeds = medications.length
    let takenMeds = 0

    medications.forEach((med) => {
      const doseOnDate = med.doseRecords?.find(
        (dose) =>
          format(new Date(dose.timestamp), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd")
      )
      if (doseOnDate && !doseOnDate.skipped) {
        takenMeds++
      }
    })

    return (takenMeds / totalMeds) * 100
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Medication Statistics</h2>
        <Select
          value={timeframe}
          onValueChange={(value: "week" | "month" | "year") =>
            setTimeframe(value)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overall Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {calculateOverallAdherence()}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doses This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {calculateTotalDoses()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Missed Doses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {calculateMissedDoses()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adherence Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  function calculateOverallAdherence() {
    const totalDoses = medications.reduce((total, med) => {
      return total + (med.doseRecords?.length || 0)
    }, 0)

    const takenDoses = medications.reduce((total, med) => {
      return (
        total +
        (med.doseRecords?.filter((dose) => !dose.skipped).length || 0)
      )
    }, 0)

    return totalDoses === 0
      ? 100
      : Math.round((takenDoses / totalDoses) * 100)
  }

  function calculateTotalDoses() {
    return medications.reduce((total, med) => {
      return (
        total +
        (med.doseRecords?.filter((dose) =>
          isWithinTimeframe(new Date(dose.timestamp))
        ).length || 0)
      )
    }, 0)
  }

  function calculateMissedDoses() {
    return medications.reduce((total, med) => {
      return (
        total +
        (med.doseRecords?.filter(
          (dose) =>
            dose.skipped && isWithinTimeframe(new Date(dose.timestamp))
        ).length || 0)
      )
    }, 0)
  }

  function isWithinTimeframe(date: Date) {
    const now = new Date()
    switch (timeframe) {
      case "week":
        return date >= startOfWeek(now) && date <= endOfWeek(now)
      case "month":
        return date.getMonth() === now.getMonth()
      case "year":
        return date.getFullYear() === now.getFullYear()
      default:
        return false
    }
  }
} 