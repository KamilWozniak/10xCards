import type { CreateGenerationRequestDTO } from '~/types/dto/types'
import { ValidationError } from '../errors/custom-errors'

/**
 * Validates the request body for POST /api/generations
 *
 * @param body - Raw request body to validate
 * @returns Validated CreateGenerationRequestDTO
 * @throws ValidationError if validation fails
 */
export function validateCreateGenerationRequest(body: any): CreateGenerationRequestDTO {
  // Check if body exists
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Invalid request format', 'Request body must be a valid JSON object')
  }

  // Check if source_text field exists
  if (!('source_text' in body)) {
    throw new ValidationError('Invalid input', 'source_text field is required')
  }

  const { source_text } = body

  // Check if source_text is a string
  if (typeof source_text !== 'string') {
    throw new ValidationError('Invalid input', 'source_text must be a string')
  }

  // Validate length constraints
  const length = source_text.length

  if (length < 1000) {
    throw new ValidationError(
      'Invalid input',
      `source_text must be between 1000 and 10000 characters. Received: ${length} characters`
    )
  }

  if (length > 10000) {
    throw new ValidationError(
      'Invalid input',
      `source_text must be between 1000 and 10000 characters. Received: ${length} characters`
    )
  }

  // Return validated DTO
  return {
    source_text,
  }
}
