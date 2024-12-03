"use client"

import { useEffect, useState } from "react"
import { ErrorData } from "@/components/ui/error-data"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormField } from "@/components/ui/form"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { z } from "zod"

const notificationSchema = z.object({
  emailNotifications: z.coerce.boolean(),
  pushNotifications: z.coerce.boolean(),
  reminderTime: z.coerce.number().min(0).max(23),
  reminderBuffer: z.coerce.number().min(0).max(60),
  soundEnabled: z.coerce.boolean(),
  vibrationEnabled: z.coerce.boolean(),
})

type NotificationPreferences = z.infer<typeof notificationSchema>

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: false,
  reminderTime: 9,
  reminderBuffer: 30,
  soundEnabled: true,
  vibrationEnabled: true,
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const {
    errors,
    isSubmitting,
    validateForm,
    clearErrors,
  } = useFormValidation({
    schema: notificationSchema,
    onSubmit: async (data) => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error('Failed to update preferences')
        const updatedData = await response.json()
        setPreferences(updatedData)
        toast({
          title: "Success",
          description: "Notification settings updated successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update notification settings",
          variant: "destructive",
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  async function fetchPreferences() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/user/preferences')
      if (!response.ok) throw new Error('Failed to fetch preferences')
      const data = await response.json()
      setPreferences(data)
    } catch (error) {
      setError(error as Error)
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePreferenceChange(updates: Partial<NotificationPreferences>) {
    const updatedPreferences = { ...preferences, ...updates }
    try {
      await validateForm(updatedPreferences)
      setPreferences(updatedPreferences)
    } catch (error) {
      // Error is handled by the validation hook
      return
    }
  }

  return (
    <ErrorData
      title="Notification Settings Error"
      description="Failed to load notification settings"
      onRetry={fetchPreferences}
      showCard={false}
    >
      <Form
        schema={notificationSchema}
        onSubmit={async () => {}} // Form submission is handled by individual field changes
        className="space-y-6"
      >
        <FormField
          name="emailNotifications"
          label="Email Notifications"
          errors={errors}
        >
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) =>
              handlePreferenceChange({ emailNotifications: checked })
            }
            disabled={isLoading || isSubmitting}
          />
        </FormField>

        <FormField
          name="pushNotifications"
          label="Push Notifications"
          errors={errors}
        >
          <Switch
            checked={preferences.pushNotifications}
            onCheckedChange={(checked) =>
              handlePreferenceChange({ pushNotifications: checked })
            }
            disabled={isLoading || isSubmitting}
          />
        </FormField>

        <FormField
          name="reminderTime"
          label="Default Reminder Time"
          errors={errors}
        >
          <div className="flex items-center gap-4">
            <Slider
              value={[preferences.reminderTime]}
              min={0}
              max={23}
              step={1}
              onValueChange={([value]) =>
                handlePreferenceChange({ reminderTime: value })
              }
              disabled={isLoading || isSubmitting}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-16">
              {preferences.reminderTime.toString().padStart(2, "0")}:00
            </span>
          </div>
        </FormField>

        <FormField
          name="reminderBuffer"
          label="Reminder Buffer"
          errors={errors}
        >
          <div className="flex items-center gap-4">
            <Slider
              value={[preferences.reminderBuffer]}
              min={0}
              max={60}
              step={5}
              onValueChange={([value]) =>
                handlePreferenceChange({ reminderBuffer: value })
              }
              disabled={isLoading || isSubmitting}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-16">
              {preferences.reminderBuffer} min
            </span>
          </div>
        </FormField>

        <FormField
          name="soundEnabled"
          label="Sound Effects"
          errors={errors}
        >
          <Switch
            checked={preferences.soundEnabled}
            onCheckedChange={(checked) =>
              handlePreferenceChange({ soundEnabled: checked })
            }
            disabled={isLoading || isSubmitting}
          />
        </FormField>

        <FormField
          name="vibrationEnabled"
          label="Vibration"
          errors={errors}
        >
          <Switch
            checked={preferences.vibrationEnabled}
            onCheckedChange={(checked) =>
              handlePreferenceChange({ vibrationEnabled: checked })
            }
            disabled={isLoading || isSubmitting}
          />
        </FormField>
      </Form>
    </ErrorData>
  )
} 