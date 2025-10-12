/**
 * Custom error classes for API error handling
 * Each error type corresponds to specific HTTP status codes
 */

/**
 * Validation error for invalid request data
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends Error {
  public readonly statusCode: number = 400
  public readonly details?: string

  constructor(message: string, details?: string) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

/**
 * AI Service error for failures during AI generation
 * HTTP Status: 500 Internal Server Error
 */
export class AIServiceError extends Error {
  public readonly statusCode: number = 500
  public readonly errorCode: string
  public readonly details?: string

  constructor(message: string, errorCode: string, details?: string) {
    super(message)
    this.name = 'AIServiceError'
    this.errorCode = errorCode
    this.details = details
  }
}

/**
 * Database error for database operation failures
 * HTTP Status: 500 Internal Server Error
 */
export class DatabaseError extends Error {
  public readonly statusCode: number = 500
  public readonly details?: string

  constructor(message: string, details?: string) {
    super(message)
    this.name = 'DatabaseError'
    this.details = details
  }
}

/**
 * Authentication error for missing or invalid tokens
 * HTTP Status: 401 Unauthorized
 */
export class AuthenticationError extends Error {
  public readonly statusCode: number = 401
  public readonly details?: string

  constructor(message: string = 'Unauthorized', details?: string) {
    super(message)
    this.name = 'AuthenticationError'
    this.details = details
  }
}
