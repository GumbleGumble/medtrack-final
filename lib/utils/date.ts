import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"

export function formatLastTaken(date: Date | null): string {
  if (!date) return "Never"
  
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`
  }
  
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`
  }
  
  return formatDistanceToNow(date, { addSuffix: true })
}

export function formatDoseTime(date: Date): string {
  return format(date, "h:mm a")
}