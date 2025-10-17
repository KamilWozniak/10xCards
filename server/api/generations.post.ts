import type {
  CreateGenerationRequestDTO,
  CreateGenerationResponseDTO,
  FlashcardProposalDTO,
} from '~/types/dto/types'
import type { CreateGenerationCommand } from '~/types/commands/generation-commands'
import { validateCreateGenerationRequest } from '../utils/validators/generation-validator'
import {
  ValidationError,
  AIServiceError,
  DatabaseError,
  UnauthorizedError,
} from '../utils/errors/custom-errors'
import { getUserId } from '../utils/auth/get-user-id'
import { computeHash } from '../utils/crypto/hash'
import { createTimer } from '../utils/timer'
import { createAIService } from '~/services/ai/AIService'
import { createGenerationsService } from '~/services/database/GenerationsService'
import { createGenerationErrorLoggerService } from '~/services/database/GenerationErrorLoggerService'
import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'

/**
 * POST /api/generations
 *
 * Initiates AI flashcard generation process from user-provided source text.
 * Validates input, calls AI service, stores generation metadata, and returns flashcard proposals.
 *
 * @returns 201 Created with generation_id and flashcard proposals
 * @throws 400 Bad Request if validation fails
 * @throws 401 Unauthorized if authentication fails
 * @throws 500 Internal Server Error if AI service or database fails
 */
export default defineEventHandler(async event => {
  try {
    // 0. Create Supabase server client for database operations
    const supabase = createSupabaseServerClient(event)

    // 1. Get authenticated user ID from session
    const userId = await getUserId(event)

    // 2. Parse and validate request body
    const body = await readBody(event)
    const validatedRequest: CreateGenerationRequestDTO = validateCreateGenerationRequest(body)

    // 3. Preprocessing - compute hash and length
    const sourceText = validatedRequest.source_text
    const sourceTextHash = computeHash(sourceText)
    const sourceTextLength = sourceText.length

    // 4. Start timer for measuring generation duration
    const timer = createTimer()

    // 5. Call AI Service to generate flashcard proposals
    const aiService = createAIService()
    const model = aiService.getModel()

    let aiResult
    try {
      aiResult = await aiService.generateFlashcards(sourceText)
    } catch (error) {
      // Log AI error to database
      const errorLogger = createGenerationErrorLoggerService(supabase)
      await errorLogger.log({
        user_id: userId,
        model,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        error_code: 'AI_GENERATION_FAILED',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })

      // Return generic error to user
      throw new AIServiceError(
        'Failed to generate flashcards. Please try again later.',
        'AI_GENERATION_FAILED',
        'AI service encountered an error'
      )
    }

    // 6. Stop timer and get duration
    const generationDuration = timer.elapsed()

    // 7. Save generation metadata to database
    const generationsService = createGenerationsService(supabase)
    const command: CreateGenerationCommand = {
      user_id: userId,
      model,
      source_text_hash: sourceTextHash,
      source_text_length: sourceTextLength,
      generated_count: aiResult.count,
      generation_duration: generationDuration,
    }

    console.log('[generations.post] Attempting to save generation to database:', command)

    let generation
    try {
      generation = await generationsService.create(command)
      console.log('[generations.post] Generation saved successfully:', generation.id)
    } catch (error) {
      console.error('[generations.post] Database error:', error)
      console.error('[generations.post] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw new DatabaseError(
        'Database error. Please try again.',
        error instanceof Error ? error.message : 'Unknown database error'
      )
    }

    // 8. Prepare flashcard proposals response
    const flashcardProposals: FlashcardProposalDTO[] = aiResult.proposals.map(proposal => ({
      front: proposal.front,
      back: proposal.back,
      source: 'ai-full' as const,
    }))

    // 9. Return success response
    const response: CreateGenerationResponseDTO = {
      generation_id: generation.id,
      flashcards_proposals: flashcardProposals,
      generated_count: aiResult.count,
    }

    return response
  } catch (error) {
    // Handle known error types
    if (error instanceof UnauthorizedError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        data: {
          error: error.message,
          details: error.details,
        },
      })
    }

    if (error instanceof ValidationError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        data: {
          error: error.message,
          details: error.details,
        },
      })
    }

    if (error instanceof AIServiceError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        data: {
          error: error.message,
          details: error.details,
        },
      })
    }

    if (error instanceof DatabaseError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        data: {
          error: error.message,
          details: error.details,
        },
      })
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/generations:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        error: 'An unexpected error occurred',
        details: 'Please try again later',
      },
    })
  }
})
