"use client"

import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { addDays, subDays } from "date-fns"
import { MedicationWithDoses } from "@/types/medication"
import { TimeOfDay, formatTimeRange } from "@/lib/date-utils"

interface HistoryFiltersProps {
  filters: {
    startDate: Date
    endDate: Date
    medicationIds: string[]
    groupIds: string[]
    includeSkipped: boolean
    status: 'taken' | 'skipped' | 'all'
    timeOfDay: TimeOfDay | 'all'
    search: string
    page: number
    limit: number
    sortField: string
    sortDirection: 'asc' | 'desc'
  }
  onFiltersChange: (filters: any) => void
  medications: MedicationWithDoses[]
  groups: { id: string; name: string }[]
}

const PRESET_RANGES = [
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
  { label: "Last 90 days", value: "90days" },
  { label: "All time", value: "all" },
]

const TIME_OF_DAY_OPTIONS: { label: string; value: TimeOfDay | 'all' }[] = [
  { label: "All Times", value: "all" },
  { label: `Morning (${formatTimeRange('morning')})`, value: "morning" },
  { label: `Afternoon (${formatTimeRange('afternoon')})`, value: "afternoon" },
  { label: `Evening (${formatTimeRange('evening')})`, value: "evening" },
  { label: `Night (${formatTimeRange('night')})`, value: "night" },
]

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Taken", value: "taken" },
  { label: "Skipped", value: "skipped" },
]

const SORT_OPTIONS = [
  { label: "Date & Time", value: "timestamp" },
  { label: "Medication Name", value: "medicationName" },
  { label: "Status", value: "status" },
]

export function HistoryFilters({
  filters,
  onFiltersChange,
  medications,
  groups,
}: HistoryFiltersProps) {
  function handleRangeChange(range: { from: Date; to: Date }) {
    onFiltersChange({
      ...filters,
      startDate: range.from,
      endDate: range.to,
    })
  }

  function handlePresetChange(value: string) {
    const now = new Date()
    let startDate: Date

    switch (value) {
      case "7days":
        startDate = subDays(now, 7)
        break
      case "30days":
        startDate = subDays(now, 30)
        break
      case "90days":
        startDate = subDays(now, 90)
        break
      case "all":
        startDate = new Date(0)
        break
      default:
        return
    }

    onFiltersChange({
      ...filters,
      startDate,
      endDate: now,
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-4">
              <DatePickerWithRange
                value={{
                  from: filters.startDate,
                  to: filters.endDate,
                }}
                onChange={handleRangeChange}
              />
              <Select onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Search medications or groups..."
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value, page: 1 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Medication Group</Label>
            <Select
              value={filters.groupIds.length === 1 ? filters.groupIds[0] : "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  groupIds: value === "all" ? [] : [value],
                  page: 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Medication</Label>
            <Select
              value={
                filters.medicationIds.length === 1
                  ? filters.medicationIds[0]
                  : "all"
              }
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  medicationIds: value === "all" ? [] : [value],
                  page: 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Medications</SelectItem>
                {medications.map((med) => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time of Day</Label>
            <Select
              value={filters.timeOfDay}
              onValueChange={(value: TimeOfDay | 'all') =>
                onFiltersChange({ ...filters, timeOfDay: value, page: 1 })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time of day" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OF_DAY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value: 'taken' | 'skipped' | 'all') =>
                onFiltersChange({ ...filters, status: value, page: 1 })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort By</Label>
            <div className="flex gap-2">
              <Select
                value={filters.sortField}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, sortField: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.sortDirection}
                onValueChange={(value: 'asc' | 'desc') =>
                  onFiltersChange({ ...filters, sortDirection: value })
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest</SelectItem>
                  <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 