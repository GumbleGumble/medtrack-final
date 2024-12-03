"use client"

import { ErrorBoundary } from "@/components/error-boundary"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface ErrorDialogProps {
  children: React.ReactNode
  title?: string
  description?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ErrorDialog({
  children,
  title,
  description,
  open,
  onOpenChange,
}: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ErrorBoundary
        fallback={
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <DialogTitle>Error</DialogTitle>
              </div>
              <DialogDescription>
                An unexpected error occurred. Please try again.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        }
      >
        {children}
      </ErrorBoundary>
    </Dialog>
  )
} 