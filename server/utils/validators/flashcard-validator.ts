import type {
  CreateFlashcardsRequestDTO,
  CreateFlashcardDTO,
  FlashcardSource,
  UpdateFlashcardDTO,
  FlashcardListQueryDTO,
} from '~/types/dto/types'
import { ValidationError } from '../errors/custom-errors'

/**
 * Valid flashcard source values
 */
const VALID_SOURCES: FlashcardSource[] = ['ai-full', 'ai-edited', 'manual']

/**
 * Maximum number of flashcards that can be created in a single request
 */
const MAX_FLASHCARDS_PER_REQUEST = 50

/**
 * Validates the request body for POST /api/flashcards
 *
 * @param body - Raw request body to validate
 * @returns Validated CreateFlashcardsRequestDTO
 * @throws ValidationError if validation fails
 */
export function validateCreateFlashcardsRequest(body: any): CreateFlashcardsRequestDTO {
  // Check if body exists
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Invalid JSON format', 'Request body must be a valid JSON object')
  }

  // Check if flashcards field exists
  if (!('flashcards' in body)) {
    throw new ValidationError('Missing required field: flashcards', 'flashcards field is required')
  }

  const { flashcards } = body

  // Check if flashcards is an array
  if (!Array.isArray(flashcards)) {
    throw new ValidationError('Invalid input', 'flashcards must be an array')
  }

  // Check if flashcards array is not empty
  if (flashcards.length === 0) {
    throw new ValidationError(
      'Flashcards array cannot be empty',
      'At least one flashcard must be provided'
    )
  }

  // Check if flashcards array is not too large
  if (flashcards.length > MAX_FLASHCARDS_PER_REQUEST) {
    throw new ValidationError(
      'Too many flashcards',
      `Maximum ${MAX_FLASHCARDS_PER_REQUEST} flashcards allowed per request. Received: ${flashcards.length}`
    )
  }

  // Validate each flashcard
  const validatedFlashcards: CreateFlashcardDTO[] = flashcards.map((flashcard, index) => {
    return validateSingleFlashcard(flashcard, index)
  })

  return {
    flashcards: validatedFlashcards,
  }
}

/**
 * Validates a single flashcard object
 *
 * @param flashcard - Single flashcard object to validate
 * @param index - Index of the flashcard in the array (for error messages)
 * @returns Validated CreateFlashcardDTO
 * @throws ValidationError if validation fails
 */
function validateSingleFlashcard(flashcard: any, index: number): CreateFlashcardDTO {
  // Check if flashcard is an object
  if (!flashcard || typeof flashcard !== 'object') {
    throw new ValidationError(
      'Invalid flashcard format',
      `Flashcard at index ${index} must be an object`
    )
  }

  // Validate front field
  if (!('front' in flashcard)) {
    throw new ValidationError(
      'Missing required field',
      `Flashcard at index ${index} is missing required field: front`
    )
  }

  if (typeof flashcard.front !== 'string') {
    throw new ValidationError(
      'Invalid field type',
      `Flashcard at index ${index}: front must be a string`
    )
  }

  if (flashcard.front.length === 0) {
    throw new ValidationError(
      'Invalid field value',
      `Flashcard at index ${index}: front cannot be empty`
    )
  }

  if (flashcard.front.length > 200) {
    throw new ValidationError(
      'Field exceeds maximum length',
      `Flashcard at index ${index}: front exceeds maximum length of 200 characters. Received: ${flashcard.front.length}`
    )
  }

  // Validate back field
  if (!('back' in flashcard)) {
    throw new ValidationError(
      'Missing required field',
      `Flashcard at index ${index} is missing required field: back`
    )
  }

  if (typeof flashcard.back !== 'string') {
    throw new ValidationError(
      'Invalid field type',
      `Flashcard at index ${index}: back must be a string`
    )
  }

  if (flashcard.back.length === 0) {
    throw new ValidationError(
      'Invalid field value',
      `Flashcard at index ${index}: back cannot be empty`
    )
  }

  if (flashcard.back.length > 500) {
    throw new ValidationError(
      'Field exceeds maximum length',
      `Flashcard at index ${index}: back exceeds maximum length of 500 characters. Received: ${flashcard.back.length}`
    )
  }

  // Validate source field
  if (!('source' in flashcard)) {
    throw new ValidationError(
      'Missing required field',
      `Flashcard at index ${index} is missing required field: source`
    )
  }

  if (!VALID_SOURCES.includes(flashcard.source)) {
    throw new ValidationError(
      'Invalid source value',
      `Flashcard at index ${index}: source must be one of: ${VALID_SOURCES.join(', ')}. Received: ${flashcard.source}`
    )
  }

  // Validate generation_id field based on source
  const source = flashcard.source as FlashcardSource
  const generationId = flashcard.generation_id

  // For ai-full and ai-edited sources, generation_id is required
  if (source === 'ai-full' || source === 'ai-edited') {
    if (generationId === undefined || generationId === null) {
      throw new ValidationError(
        'Invalid generation_id for source type',
        `Flashcard at index ${index}: generation_id is required for source type '${source}'`
      )
    }

    if (typeof generationId !== 'number' || !Number.isInteger(generationId) || generationId <= 0) {
      throw new ValidationError(
        'Invalid generation_id for source type',
        `Flashcard at index ${index}: generation_id must be a positive integer for source type '${source}'`
      )
    }
  }

  // For manual source, generation_id must be null or undefined
  if (source === 'manual') {
    if (generationId !== undefined && generationId !== null) {
      throw new ValidationError(
        'Invalid generation_id for source type',
        `Flashcard at index ${index}: generation_id must be null for source type 'manual'`
      )
    }
  }

  return {
    front: flashcard.front.trim(),
    back: flashcard.back.trim(),
    source,
    generation_id: source === 'manual' ? null : generationId,
  }
}

/**
 * Validates the request body for PUT /api/flashcards/{id}
 *
 * @param body - Raw request body to validate
 * @returns Validated UpdateFlashcardDTO
 * @throws ValidationError if validation fails
 */
export function validateUpdateFlashcardRequest(body: any): UpdateFlashcardDTO {
  // Check if body exists
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Invalid JSON format', 'Request body must be a valid JSON object')
  }

  // Check if at least one field is provided
  const hasFront = 'front' in body
  const hasBack = 'back' in body
  const hasSource = 'source' in body

  if (!hasFront && !hasBack && !hasSource) {
    throw new ValidationError(
      'Missing required fields',
      'At least one field (front, back, or source) must be provided for update'
    )
  }

  const validatedData: UpdateFlashcardDTO = {}

  // Validate front field if provided
  if (hasFront) {
    if (typeof body.front !== 'string') {
      throw new ValidationError('Invalid field type', 'front must be a string')
    }

    if (body.front.length === 0) {
      throw new ValidationError('Invalid field value', 'front cannot be empty')
    }

    if (body.front.length > 200) {
      throw new ValidationError(
        'Field exceeds maximum length',
        `front exceeds maximum length of 200 characters. Received: ${body.front.length}`
      )
    }

    validatedData.front = body.front.trim()
  }

  // Validate back field if provided
  if (hasBack) {
    if (typeof body.back !== 'string') {
      throw new ValidationError('Invalid field type', 'back must be a string')
    }

    if (body.back.length === 0) {
      throw new ValidationError('Invalid field value', 'back cannot be empty')
    }

    if (body.back.length > 500) {
      throw new ValidationError(
        'Field exceeds maximum length',
        `back exceeds maximum length of 500 characters. Received: ${body.back.length}`
      )
    }

    validatedData.back = body.back.trim()
  }

  // Validate source field if provided
  if (hasSource) {
    if (!VALID_SOURCES.includes(body.source)) {
      throw new ValidationError(
        'Invalid source value',
        `source must be one of: ${VALID_SOURCES.join(', ')}. Received: ${body.source}`
      )
    }

    validatedData.source = body.source
  }

  return validatedData
}

/**
 * Validates query parameters for GET /api/flashcards
 *
 * @param query - Raw query parameters from the request
 * @returns Validated FlashcardListQueryDTO with defaults applied
 * @throws ValidationError if validation fails
 */
export function validateFlashcardListQuery(query: any): FlashcardListQueryDTO {
  const validatedQuery: FlashcardListQueryDTO = {}

  // Handle undefined or null query
  if (!query || typeof query !== 'object') {
    return validatedQuery
  }

  // Validate page parameter
  if (query.page !== undefined) {
    const page = parseInt(query.page, 10)
    if (isNaN(page) || page < 1) {
      throw new ValidationError(
        'Invalid page parameter',
        'page must be a positive integer starting from 1'
      )
    }
    validatedQuery.page = page
  }

  // Validate limit parameter
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit, 10)
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError(
        'Invalid limit parameter',
        'limit must be a positive integer between 1 and 100'
      )
    }
    validatedQuery.limit = limit
  }

  return validatedQuery
}
