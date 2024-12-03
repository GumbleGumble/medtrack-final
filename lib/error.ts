export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Not authorized') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return new Response(error.message, { status: error.statusCode })
  }

  if (error instanceof ValidationError) {
    return new Response(error.message, { status: 422 })
  }

  if (error instanceof AuthenticationError) {
    return new Response(error.message, { status: 401 })
  }

  if (error instanceof AuthorizationError) {
    return new Response(error.message, { status: 403 })
  }

  console.error('Unhandled error:', error)
  return new Response('Internal server error', { status: 500 })
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isAuthError(error: unknown): error is AuthenticationError | AuthorizationError {
  return error instanceof AuthenticationError || error instanceof AuthorizationError
}

export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
} 