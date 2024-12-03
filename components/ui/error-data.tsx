"use client"

import { ErrorBoundary } from "@/components/error-boundary"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorDataProps {
  children: React.ReactNode
  onRetry?: () => void
  title?: string
  description?: string
  className?: string
  showCard?: boolean
}

export function ErrorData({
  children,
  onRetry,
  title = "Data Error",
  description = "An error occurred while loading the data.",
  className = "",
  showCard = true,
}: ErrorDataProps) {
  const content = (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
          <h3 className="font-medium text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )

  if (!showCard) {
    return <div className={className}>{content}</div>
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {content}
    </Card>
  )
} 