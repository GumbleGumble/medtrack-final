"use client"

import * as React from "react"
import { Toast, ToastProvider, ToastViewport } from "./toast"
import { useToast } from "./use-toast"
import type { ToastProps } from "./types"

interface ToasterProps {
  className?: string
}

export function Toaster({ className }: ToasterProps) {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }: ToastProps & { id: string }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <div className="font-medium">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          {action}
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

export { Toast, ToastProvider, ToastViewport } 