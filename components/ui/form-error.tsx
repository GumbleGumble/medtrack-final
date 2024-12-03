"use client"

import { AlertTriangle } from "lucide-react"

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null

  return (
    <div className={`flex items-center gap-2 text-destructive text-sm mt-2 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}

interface FormFieldErrorProps {
  name: string
  errors?: Record<string, string[]>
  className?: string
}

export function FormFieldError({ name, errors, className }: FormFieldErrorProps) {
  if (!errors?.[name]) return null

  return <FormError message={errors[name][0]} className={className} />
}

interface FormErrorSummaryProps {
  errors?: Record<string, string[]>
  className?: string
}

export function FormErrorSummary({ errors, className = "" }: FormErrorSummaryProps) {
  if (!errors || Object.keys(errors).length === 0) return null

  return (
    <div className={`rounded-lg border border-destructive/50 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="font-medium">There were errors with your submission</h3>
      </div>
      <ul className="list-disc list-inside space-y-1">
        {Object.entries(errors).map(([field, messages]) => (
          <li key={field} className="text-sm text-muted-foreground">
            {field}: {messages[0]}
          </li>
        ))}
      </ul>
    </div>
  )
} 