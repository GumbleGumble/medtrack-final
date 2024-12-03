import { useState, useCallback } from "react"
import type { ToastProps } from "./toast"

interface Toast extends ToastProps {
  id: string
}

interface UseToastReturn {
  toasts: Toast[]
  toast: (props: ToastProps) => void
  dismiss: (id: string) => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { toasts, toast, dismiss }
} 