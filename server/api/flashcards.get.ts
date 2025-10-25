import type { PaginatedFlashcardsResponseDTO, ApiErrorResponseDTO } from '~/types/dto/types'
import { validateFlashcardListQuery } from '~/server/utils/validators/flashcard-validator'
import { getUserId } from '~/server/utils/auth/get-user-id'
import { createFlashcardsService } from '~/services/database/FlashcardsService'
import { ValidationError, UnauthorizedError } from '~/server/utils/errors/custom-errors'
import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'

/**
 * GET /api/flashcards
 *
 * Retrieves a paginated list of flashcards for an authenticated user.
 * Supports pagination with page and limit parameters.
 *
 * Query Parameters:
 * - page (optional): Page number (default: 1, minimum: 1)
 * - limit (optional): Number of flashcards per page (default: 10, maximum: 100)
 *
 * Response (200 OK):
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "front": "Question",
 *       "back": "Answer",
 *       "source": "manual",
 *       "created_at": "2025-10-25T10:00:00Z",
 *       "updated_at": "2025-10-25T10:00:00Z",
 *       "generation_id": null,
 *       "user_id": "uuid"
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 100
 *   }
 * }
 */
export default defineEventHandler(
  async (event): Promise<PaginatedFlashcardsResponseDTO | ApiErrorResponseDTO> => {
    try {
      // 0. Create Supabase server client for database operations
      const supabase = createSupabaseServerClient(event)

      // 1. Validate authentication
      let userId: string
      try {
        userId = await getUserId(event)
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          setResponseStatus(event, 401)
          return {
            error: 'Unauthorized',
            details: error.message || 'Authentication token is required',
          }
        }
        throw error
      }

      // 2. Parse and validate query parameters
      const queryParams = getQuery(event)
      let validatedQuery
      try {
        validatedQuery = validateFlashcardListQuery(queryParams)
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

      // 3. Get paginated flashcards from service
      const flashcardsService = createFlashcardsService(supabase)
      let flashcardsResponse
      try {
        flashcardsResponse = await flashcardsService.getPaginatedFlashcards(userId, validatedQuery)
      } catch (error) {
        console.error('Error getting paginated flashcards:', error)
        setResponseStatus(event, 500)
        return {
          error: 'Internal server error',
          details: 'Failed to retrieve flashcards',
        }
      }

      // 4. Return success response
      return flashcardsResponse
    } catch (error) {
      console.error('Unexpected error in flashcards GET endpoint:', error)
      setResponseStatus(event, 500)
      return {
        error: 'Internal server error',
        details: 'An unexpected error occurred',
      }
    }
  }
)
