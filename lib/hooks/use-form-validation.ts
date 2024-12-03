import { useState } from "react"
import { z } from "zod"

interface UseFormValidationProps<T extends z.ZodType> {
  schema: T
  onSubmit: (data: z.infer<T>) => Promise<void>
  onError?: (error: Error) => void
}

export function useFormValidation<T extends z.ZodType>({
  schema,
  onSubmit,
  onError,
}: UseFormValidationProps<T>) {
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = async (data: unknown) => {
    try {
      setIsSubmitting(true)
      setErrors({})

      // Validate data against schema
      const validData = await schema.parseAsync(data)

      // Call onSubmit with validated data
      await onSubmit(validData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Transform Zod errors into our format
        const formattedErrors: Record<string, string[]> = {}
        error.errors.forEach((err) => {
          const path = err.path.join(".")
          if (!formattedErrors[path]) {
            formattedErrors[path] = []
          }
          formattedErrors[path].push(err.message)
        })
        setErrors(formattedErrors)
      } else {
        // Handle other errors
        onError?.(error as Error)
      }
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearErrors = () => setErrors({})

  const getFieldError = (field: string) => errors[field]?.[0]

  return {
    errors,
    isSubmitting,
    validateForm,
    clearErrors,
    getFieldError,
  }
} 