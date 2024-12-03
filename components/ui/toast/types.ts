import { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ToastActionElement } from '@radix-ui/react-toast'

export interface ToastProps {
  id?: string
  title?: ReactNode
  description?: ReactNode
  action?: ToastActionElement
  variant?: 'default' | 'destructive'
  className?: string
  duration?: number
}

export interface Toast extends ToastProps {
  id: string
}

export interface UseToastProps {
  duration?: number
  className?: string
}

export interface UseToastReturn {
  toasts: Toast[]
  toast: (props: ToastProps) => void
  dismiss: (id: string) => void
} 