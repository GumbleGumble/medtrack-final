"use client"

import { ErrorBoundary } from "@/components/error-boundary"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorFormProps {
  children: React.ReactNode
  onRetry?: () => void
}

export function ErrorForm({ children, onRetry }: ErrorFormProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-destructive/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-medium">Form Error</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            An error occurred while rendering this form.
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-full"
            >
              Try Again
            </Button>
          )}
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          try {
            // Let the actual form handler deal with the submission
            e.currentTarget.dispatchEvent(
              new Event('submit', { bubbles: true, cancelable: true })
            )
          } catch (error) {
            console.error('Form submission error:', error)
            throw error // Let error boundary handle it
          }
        }}
        className="space-y-4"
      >
        {children}
      </form>
    </ErrorBoundary>
  )
} 