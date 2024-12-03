"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Navigation } from "@/components/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { timezones } from "@/lib/timezones"
import { themes } from "@/lib/themes"

interface UserPreferences {
  theme: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  reminderTime: number
  reminderBuffer: number
  soundEnabled: boolean
  vibrationEnabled: boolean
  colorScheme: string
  fontSize: string
  useHighContrast: boolean
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    fetchPreferences()
  }, [])

  async function fetchPreferences() {
    try {
      const response = await fetch('/api/user/preferences')
      if (!response.ok) throw new Error('Failed to fetch preferences')
      const data = await response.json()
      setPreferences(data)
      setTheme(data.theme)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preferences",
        variant: "destructive",
      })
    }
  }

  async function updatePreferences(updates: Partial<UserPreferences>) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update preferences')

      const updatedPreferences = await response.json()
      setPreferences(updatedPreferences)
      
      if (updates.theme) {
        setTheme(updates.theme)
      }

      toast({
        title: "Success",
        description: "Preferences updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!preferences) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-2xl mx-auto p-4 pb-20">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how MedTrack looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => updatePreferences({ theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      {themes.map((theme) => (
                        <SelectItem key={theme.name} value={theme.name}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select
                    value={preferences.colorScheme}
                    onValueChange={(value) =>
                      updatePreferences({ colorScheme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how and when you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      updatePreferences({ emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <Switch
                    id="pushNotifications"
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) =>
                      updatePreferences({ pushNotifications: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Reminder Time</Label>
                  <Select
                    value={preferences.reminderTime.toString()}
                    onValueChange={(value) =>
                      updatePreferences({ reminderTime: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, "0")}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reminder Buffer (minutes)</Label>
                  <Slider
                    value={[preferences.reminderBuffer]}
                    min={0}
                    max={60}
                    step={5}
                    onValueChange={([value]) =>
                      updatePreferences({ reminderBuffer: value })
                    }
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {preferences.reminderBuffer} minutes before
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) =>
                      updatePreferences({ timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="flex items-center justify-between">
                  <Label htmlFor="soundEnabled">Sound Effects</Label>
                  <Switch
                    id="soundEnabled"
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) =>
                      updatePreferences({ soundEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="vibrationEnabled">Vibration</Label>
                  <Switch
                    id="vibrationEnabled"
                    checked={preferences.vibrationEnabled}
                    onCheckedChange={(checked) =>
                      updatePreferences({ vibrationEnabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  Make MedTrack easier to use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select
                    value={preferences.fontSize}
                    onValueChange={(value) =>
                      updatePreferences({ fontSize: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="useHighContrast">High Contrast</Label>
                  <Switch
                    id="useHighContrast"
                    checked={preferences.useHighContrast}
                    onCheckedChange={(checked) =>
                      updatePreferences({ useHighContrast: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Navigation />
    </div>
  )
}