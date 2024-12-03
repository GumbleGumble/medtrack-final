"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  Home,
  PieChart,
  Settings,
  Clock,
  AlertTriangle,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/stats", label: "Statistics", icon: PieChart },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <ErrorBoundary
      fallback={
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-2">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground">Navigation error</span>
          </div>
        </div>
      }
    >
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="container max-w-md mx-auto">
          <div className="flex justify-around py-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </ErrorBoundary>
  )
} 