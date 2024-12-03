"use client"

import * as React from "react"
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { FormError, FormFieldError, FormErrorSummary } from "@/components/ui/form-error"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { ErrorData } from "@/components/ui/error-data"

interface FormProps<T extends z.ZodType> {
  schema: T
  onSubmit: (data: z.infer<T>) => Promise<void>
  onError?: (error: Error) => void
  children: React.ReactNode
  className?: string
  id?: string
  name?: string
}

export function Form<T extends z.ZodType>({
  schema,
  onSubmit,
  onError,
  children,
  className,
  ...props
}: FormProps<T>) {
  const {
    errors,
    isSubmitting,
    validateForm,
    clearErrors,
  } = useFormValidation({
    schema,
    onSubmit,
    onError,
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)
    
    try {
      await validateForm(data)
    } catch (error) {
      // Error is already handled by the validation hook
      return
    }
  }

  return (
    <ErrorData
      title="Form Error"
      description="An error occurred while processing the form"
      showCard={false}
    >
      <form
        {...props}
        onSubmit={handleSubmit}
        className={cn("space-y-4", className)}
        noValidate // We handle validation ourselves
      >
        <div
          role="alert"
          aria-live="polite"
        >
          <FormErrorSummary 
            errors={errors} 
            className="mb-4"
          />
        </div>
        {children}
      </form>
    </ErrorData>
  )
}

interface FormFieldProps {
  name: string
  label: string
  children: React.ReactNode
  errors?: Record<string, string[]>
  className?: string
  required?: boolean
  description?: string
}

export function FormField({
  name,
  label,
  children,
  errors,
  className,
  required,
  description,
}: FormFieldProps) {
  const id = React.useId()
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = errors?.[name] ? `${id}-error` : undefined

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(required && "after:content-['*'] after:ml-1 after:text-destructive")}
      >
        {label}
      </Label>
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}
      {React.cloneElement(children as React.ReactElement, {
        id,
        name,
        'aria-describedby': cn(descriptionId, errorId),
        'aria-required': required,
        'aria-invalid': !!errors?.[name],
      })}
      <div role="alert" aria-live="polite">
        <FormFieldError
          name={name}
          errors={errors}
        />
      </div>
    </div>
  )
}

interface FormSubmitProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  isSubmitting?: boolean
  submittingText?: string
  children: React.ReactNode
}

export function FormSubmit({
  isSubmitting,
  submittingText = "Submitting...",
  children,
  disabled,
  ...props
}: FormSubmitProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      aria-disabled={isSubmitting || disabled}
      {...props}
    >
      {isSubmitting ? submittingText : children}
    </button>
  )
}

interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}