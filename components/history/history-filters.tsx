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
import { Form, FormField } from "@/components/ui/form"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { z } from "zod"
import { DateRange } from "react-day-picker"

const SortField = {
  timestamp: "timestamp",
  medicationName: "medicationName",
  status: "status",
  dosage: "dosage",
} as const;

type SortFieldType = typeof SortField[keyof typeof SortField];

const historyFiltersSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  medicationIds: z.array(z.string()),
  groupIds: z.array(z.string()),
  includeSkipped: z.boolean(),
  status: z.enum(['taken', 'skipped', 'all']),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'all']),
  search: z.string(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  sortField: z.enum(['timestamp', 'medicationName', 'status', 'dosage']),
  sortDirection: z.enum(['asc', 'desc']),
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: "Start date must be before or equal to end date",
    path: ["startDate"],
  }
)

type HistoryFilters = z.infer<typeof historyFiltersSchema>

interface HistoryFiltersProps {
  filters: HistoryFilters
  onFiltersChange: (filters: HistoryFilters) => void
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
  { label: "Date & Time", value: SortField.timestamp },
  { label: "Medication Name", value: SortField.medicationName },
  { label: "Status", value: SortField.status },
  { label: "Dosage", value: SortField.dosage },
] as const;

export function HistoryFilters({
  filters,
  onFiltersChange,
  medications,
  groups,
}: HistoryFiltersProps) {
  const {
    errors,
    isSubmitting,
    validateForm,
    clearErrors,
  } = useFormValidation({
    schema: historyFiltersSchema,
    onSubmit: async (data) => {
      onFiltersChange(data)
    },
  })

  async function handleFilterChange(updates: Partial<HistoryFilters>) {
    const updatedFilters = { ...filters, ...updates }
    try {
      await validateForm(updatedFilters)
      onFiltersChange(updatedFilters)
    } catch (error) {
      // Error is handled by the validation hook
      return
    }
  }

  function handleRangeChange(range: DateRange | undefined) {
    if (!range?.from || !range?.to) return
    handleFilterChange({
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

    handleFilterChange({
      startDate,
      endDate: now,
    })
  }

  function handleSortFieldChange(value: SortFieldType) {
    handleFilterChange({ sortField: value });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form
          schema={historyFiltersSchema}
          onSubmit={async () => {}} // Form submission is handled by individual field changes
        >
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              name="dateRange"
              label="Date Range"
              errors={errors}
            >
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
            </FormField>

            <FormField
              name="search"
              label="Search"
              errors={errors}
            >
              <Input
                placeholder="Search medications or groups..."
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange({ search: e.target.value, page: 1 })
                }
              />
            </FormField>

            <FormField
              name="groupIds"
              label="Medication Group"
              errors={errors}
            >
              <Select
                value={filters.groupIds.length === 1 ? filters.groupIds[0] : "all"}
                onValueChange={(value) =>
                  handleFilterChange({
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
            </FormField>

            <FormField
              name="medicationIds"
              label="Medication"
              errors={errors}
            >
              <Select
                value={
                  filters.medicationIds.length === 1
                    ? filters.medicationIds[0]
                    : "all"
                }
                onValueChange={(value) =>
                  handleFilterChange({
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
            </FormField>

            <FormField
              name="timeOfDay"
              label="Time of Day"
              errors={errors}
            >
              <Select
                value={filters.timeOfDay}
                onValueChange={(value: TimeOfDay | 'all') =>
                  handleFilterChange({ timeOfDay: value, page: 1 })
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
            </FormField>

            <FormField
              name="status"
              label="Status"
              errors={errors}
            >
              <Select
                value={filters.status}
                onValueChange={(value: 'taken' | 'skipped' | 'all') =>
                  handleFilterChange({ status: value, page: 1 })
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
            </FormField>

            <FormField
              name="sort"
              label="Sort By"
              errors={errors}
            >
              <div className="flex gap-2">
                <Select
                  value={filters.sortField}
                  onValueChange={handleSortFieldChange}
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
                    handleFilterChange({ sortDirection: value })
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
            </FormField>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
} 