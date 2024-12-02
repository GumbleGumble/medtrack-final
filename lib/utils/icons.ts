import { Pill, Sun, Moon, Coffee, AlertCircle } from "lucide-react"
import { LucideIcon } from "lucide-react"

export const MEDICATION_ICONS = [
  { label: "Pill", value: "pill", icon: Pill },
  { label: "Morning", value: "sun", icon: Sun },
  { label: "Night", value: "moon", icon: Moon },
  { label: "Afternoon", value: "coffee", icon: Coffee },
  { label: "As Needed", value: "alert-circle", icon: AlertCircle },
] as const

export function getIconComponent(iconName: string): LucideIcon {
  const icon = MEDICATION_ICONS.find(i => i.value === iconName)
  return icon?.icon || Pill
}