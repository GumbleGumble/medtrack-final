"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Pill, PieChart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const items = [
    {
      href: "/medications",
      label: "Meds",
      icon: Pill,
    },
    {
      href: "/stats",
      label: "Stats",
      icon: PieChart,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="container max-w-md mx-auto flex justify-around items-center">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}