import type { CreateFlashcardsResponseDTO, ApiErrorResponseDTO } from '~/types/dto/types'
import { validateCreateFlashcardsRequest } from '~/server/utils/validators/flashcard-validator'
import { getUserId } from '~/server/utils/auth/get-user-id'
import { createFlashcardsService } from '~/services/database/FlashcardsService'
import { ValidationError } from '~/server/utils/errors/custom-errors'

/**
 * POST /api/flashcards
 *
 * Creates one or more flashcards for an authenticated user.
 * Supports both manual creation (source: "manual") and AI-generated flashcards
 * (source: "ai-full", "ai-edited").
 *
 * Request Body:
 * {
 *   "flashcards": [
 *     {
 *       "front": "string (max 200 chars)",
 *       "back": "string (max 500 chars)",
 *       "source": "ai-full" | "ai-edited" | "manual",
 *       "generation_id": "number | null"
 *     }
 *   ]
 * }
 *
 * Response (201 Created):
 * {
 *   "flashcards": [
 *     {
 *       "id": 1,
 *       "front": "Question 1",
 *       "back": "Answer 1",
 *       "source": "manual",
 *       "generation_id": null,
 *       "user_id": "uuid",
 *       "created_at": "timestamp",
 *       "updated_at": "timestamp"
 *     }
 *   ]
 * }
 */
export default defineEventHandler(
  async (event): Promise<CreateFlashcardsResponseDTO | ApiErrorResponseDTO> => {
    try {
      // 1. Validate authentication
      const userId = getUserId()
      if (!userId) {
        setResponseStatus(event, 401)
        return {
          error: 'Unauthorized',
          details: 'Authentication token is required',
        }
      }

      // 2. Parse and validate request body
      let requestBody: any
      try {
        requestBody = await readBody(event)
      } catch {
        setResponseStatus(event, 400)
        return {
          error: 'Invalid JSON format',
          details: 'Request body must be valid JSON',
        }
      }

      // 3. Validate request structure and data
      let validatedRequest
      try {
        validatedRequest = validateCreateFlashcardsRequest(requestBody)
      } catch (error) {
        if (error instanceof ValidationError) {
          setResponseStatus(event, 400)
          return {
            error: error.message,
            details: error.details,
          }
        }
        throw error
      }

      // 4. Validate generation_id ownership for AI-generated flashcards
      const flashcardsService = createFlashcardsService()
      const aiFlashcards = validatedRequest.flashcards.filter(
        flashcard => flashcard.source === 'ai-full' || flashcard.source === 'ai-edited'
      )

      if (aiFlashcards.length > 0) {
        const generationIds = aiFlashcards
          .map(flashcard => flashcard.generation_id)
          .filter((id): id is number => id !== null && id !== undefined)

        if (generationIds.length > 0) {
          try {
            const validGenerationIds = await flashcardsService.validateMultipleGenerationOwnership(
              generationIds,
              userId
            )

            // Check if all generation IDs are valid
            const invalidGenerationIds = generationIds.filter(
              id => !validGenerationIds.includes(id)
            )
            if (invalidGenerationIds.length > 0) {
              setResponseStatus(event, 400)
              return {
                error: 'Invalid generation_id for source type',
                details: `Generation IDs do not belong to user: ${invalidGenerationIds.join(', ')}`,
              }
            }
          } catch (error) {
            console.error('Error validating generation ownership:', error)
            setResponseStatus(event, 500)
            return {
              error: 'Internal server error',
              details: 'Failed to validate generation ownership',
            }
          }
        }
      }

      // 5. Prepare flashcard data for database insertion
      const flashcardData = validatedRequest.flashcards.map(flashcard => ({
        front: flashcard.front,
        back: flashcard.back,
        source: flashcard.source,
        generation_id: flashcard.generation_id,
      }))

      // 6. Create flashcards in database
      let createdFlashcards
      try {
        createdFlashcards = await flashcardsService.createMultiple(flashcardData, userId)
      } catch (error) {
        console.error('Error creating flashcards:', error)
        setResponseStatus(event, 500)
        return {
          error: 'Internal server error',
          details: 'Failed to create flashcards',
        }
      }

      // 7. Return success response
      setResponseStatus(event, 201)
      return {
        flashcards: createdFlashcards,
      }
    } catch (error) {
      console.error('Unexpected error in flashcards endpoint:', error)
      setResponseStatus(event, 500)
      return {
        error: 'Internal server error',
        details: 'An unexpected error occurred',
      }
    }
  }
)
