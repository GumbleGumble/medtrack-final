"use client"

import { useEffect, useState } from "react"
import { ErrorBoundary } from '@/components/error-boundary'
import { Navigation } from "@/components/navigation"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { TimezoneSelector } from "@/components/settings/timezone-selector"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AccessManagement } from "@/components/access/access-management"
import { MedicationGroupWithMeds } from "@/types/medication"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [groups, setGroups] = useState<MedicationGroupWithMeds[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    try {
      const response = await fetch('/api/medication-groups?include=medications')
      if (!response.ok) throw new Error('Failed to fetch medication groups')
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medication groups",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl mx-auto p-4 pb-20">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        
        <div className="space-y-8">
          <ErrorBoundary>
            <section>
              <h2 className="text-xl font-medium mb-4">Appearance</h2>
              <div className="space-y-4">
                <ThemeSelector />
              </div>
            </section>
          </ErrorBoundary>

          <ErrorBoundary>
            <section>
              <h2 className="text-xl font-medium mb-4">Time & Location</h2>
              <div className="space-y-4">
                <TimezoneSelector />
              </div>
            </section>
          </ErrorBoundary>

          <ErrorBoundary>
            <section>
              <h2 className="text-xl font-medium mb-4">Notifications</h2>
              <NotificationSettings />
            </section>
          </ErrorBoundary>

          <ErrorBoundary>
            <section>
              <h2 className="text-xl font-medium mb-4">Access Management</h2>
              <AccessManagement groups={groups} onUpdate={fetchGroups} />
            </section>
          </ErrorBoundary>
        </div>
      </main>
      <Navigation />
    </div>
  )
}