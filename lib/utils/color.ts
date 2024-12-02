import { type ClassValue } from "clsx"

export const MEDICATION_COLORS = [
  { label: "Red", value: "#ef4444", class: "bg-red-500" },
  { label: "Yellow", value: "#eab308", class: "bg-yellow-500" },
  { label: "Green", value: "#22c55e", class: "bg-green-500" },
  { label: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { label: "Purple", value: "#a855f7", class: "bg-purple-500" },
] as const

export function getColorClasses(color: string): ClassValue[] {
  const colorMap = {
    "#ef4444": ["border-red-500", "bg-red-100", "text-red-500"],
    "#eab308": ["border-yellow-500", "bg-yellow-100", "text-yellow-500"],
    "#22c55e": ["border-green-500", "bg-green-100", "text-green-500"],
    "#3b82f6": ["border-blue-500", "bg-blue-100", "text-blue-500"],
    "#a855f7": ["border-purple-500", "bg-purple-100", "text-purple-500"],
  }

  return colorMap[color as keyof typeof colorMap] || []
}