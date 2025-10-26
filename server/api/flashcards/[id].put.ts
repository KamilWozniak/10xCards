import type { ApiErrorResponseDTO, FlashcardDTO } from '~/types/dto/types'
import { defineEventHandler, getRouterParam, readBody, setResponseStatus } from 'h3'
import type { H3Event } from 'h3'
import { getUserId } from '~/server/utils/auth/get-user-id'
import { createFlashcardsService } from '~/services/database/FlashcardsService'
import { UnauthorizedError, ValidationError } from '~/server/utils/errors/custom-errors'
import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'
import type { UpdateFlashcardCommand } from '~/types/commands/generation-commands'
import { validateUpdateFlashcardRequest } from '~/server/utils/validators/flashcard-validator'

/**
 * PUT /api/flashcards/[id]
 *
 * Updates a specific flashcard belonging to the authenticated user.
 * Performs partial update of provided fields and validates ownership.
 *
 * Path Parameters:
 * - id: number - Unique identifier of the flashcard to update
 *
 * Request Body:
 * {
 *   "front"?: string, // max 200 characters
 *   "back"?: string,  // max 500 characters
 *   "source"?: "ai-full" | "ai-edited" | "manual" // enum validation
 * }
 * At least one field must be provided.
 *
 * Response (200 OK):
 * FlashcardDTO - Updated flashcard record
 */
export default defineEventHandler(
  async (event: H3Event): Promise<FlashcardDTO | ApiErrorResponseDTO> => {
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

      // 2. Parse and validate path parameter (id)
      const idParam = getRouterParam(event, 'id')
      if (!idParam) {
        setResponseStatus(event, 400)
        return {
          error: 'Missing flashcard ID',
          details: 'Path parameter "id" is required',
        }
      }

      const id = parseInt(idParam, 10)
      if (isNaN(id) || id <= 0) {
        setResponseStatus(event, 400)
        return {
          error: 'Invalid flashcard ID',
          details: 'ID must be a positive integer',
        }
      }

      // 3. Parse and validate request body
      let requestBody: any
      try {
        requestBody = await readBody(event)
      } catch (error) {
        setResponseStatus(event, 400)
        return {
          error: 'Invalid JSON format',
          details: 'Request body must be valid JSON',
        }
      }

      // Validate the update request
      let validatedData: any
      try {
        validatedData = validateUpdateFlashcardRequest(requestBody)
      } catch (error) {
        if (error instanceof ValidationError) {
          setResponseStatus(event, 400)
          return {
            error: 'Invalid input',
            details: error.details || error.message,
          }
        }
        throw error
      }

      // 4. Create update command
      const updateCommand: UpdateFlashcardCommand = {
        id,
        user_id: userId,
        ...validatedData,
      }

      // 5. Update flashcard using service
      const flashcardsService = createFlashcardsService(supabase)
      let updatedFlashcard: FlashcardDTO
      try {
        updatedFlashcard = await flashcardsService.updateFlashcard(updateCommand)
      } catch (error: any) {
        // Handle specific service errors
        if (error.message.includes('not found')) {
          setResponseStatus(event, 404)
          return {
            error: 'Flashcard not found',
            details: 'Flashcard does not exist or does not belong to the authenticated user',
          }
        }

        // Handle other database errors
        console.error('Error updating flashcard:', error)
        setResponseStatus(event, 500)
        return {
          error: 'Internal server error',
          details: 'Failed to update flashcard',
        }
      }

      // 6. Return updated flashcard
      setResponseStatus(event, 200)
      return updatedFlashcard
    } catch (error) {
      console.error('Unexpected error in update flashcard endpoint:', error)
      setResponseStatus(event, 500)
      return {
        error: 'Internal server error',
        details: 'An unexpected error occurred',
      }
    }
  }
)
