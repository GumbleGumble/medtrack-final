"use client"

import { useTheme } from "next-themes"
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
import { themes } from "@/lib/themes"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormField } from "@/components/ui/form"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { z } from "zod"

const themeSchema = z.object({
  theme: z.enum(['system', 'light', 'dark', ...themes.map(t => t.name)]),
})

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  const {
    errors,
    isSubmitting,
    validateForm,
    clearErrors,
  } = useFormValidation({
    schema: themeSchema,
    onSubmit: async (data) => {
      try {
        // Update theme
        setTheme(data.theme)
        
        // Store preference in localStorage for persistence
        localStorage.setItem('theme', data.theme)
        
        toast({
          title: "Success",
          description: "Theme updated successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update theme",
          variant: "destructive",
        })
        throw error
      }
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  async function handleThemeChange(value: string) {
    try {
      await validateForm({ theme: value })
    } catch (error) {
      // Error is handled by the validation hook
      return
    }
  }

  return (
    <ErrorData 
      title="Theme Settings Error"
      description="Failed to load theme settings"
      showCard={false}
      onRetry={() => {
        clearErrors()
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
          handleThemeChange(savedTheme)
        }
      }}
    >
      <Form
        schema={themeSchema}
        onSubmit={async () => {}} // Form submission is handled by theme changes
      >
        <FormField
          name="theme"
          label="Theme"
          errors={errors}
        >
          <Select 
            value={theme} 
            onValueChange={handleThemeChange}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select theme" />
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
        </FormField>
      </Form>
    </ErrorData>
  )
} 