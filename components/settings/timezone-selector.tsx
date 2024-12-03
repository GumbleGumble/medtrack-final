"use client"

import { useEffect, useState } from "react"
import { ErrorData } from "@/components/ui/error-data"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { timezones } from "@/lib/timezones"
import { useToast } from "@/components/ui/use-toast"

export function TimezoneSelector() {
  const [timezone, setTimezone] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchTimezone()
  }, [])

  async function fetchTimezone() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/user/preferences')
      if (!response.ok) throw new Error('Failed to fetch preferences')
      const data = await response.json()
      setTimezone(data.timezone)
    } catch (error) {
      setError(error as Error)
      toast({
        title: "Error",
        description: "Failed to load timezone preference",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateTimezone(value: string) {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone: value }),
      })

      if (!response.ok) throw new Error('Failed to update timezone')
      setTimezone(value)
      toast({
        title: "Success",
        description: "Timezone updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update timezone",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ErrorData
      title="Timezone Settings Error"
      description="Failed to load timezone settings"
      onRetry={fetchTimezone}
      showCard={false}
    >
      <div className="space-y-2">
        <Label htmlFor="timezone">Time Zone</Label>
        <Select 
          value={timezone} 
          onValueChange={updateTimezone}
          disabled={isLoading}
        >
          <SelectTrigger id="timezone">
            <SelectValue placeholder={isLoading ? "Loading..." : "Select timezone"} />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ErrorData>
  )
} 