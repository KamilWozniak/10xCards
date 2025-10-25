import type { ApiSuccessMessageDTO, ApiErrorResponseDTO } from '~/types/dto/types'
import { getUserId } from '~/server/utils/auth/get-user-id'
import { createFlashcardsService } from '~/services/database/FlashcardsService'
import { UnauthorizedError } from '~/server/utils/errors/custom-errors'
import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'
import type { DeleteFlashcardCommand } from '~/types/commands/generation-commands'

/**
 * DELETE /api/flashcards/delete/[id]
 *
 * Deletes a specific flashcard belonging to the authenticated user.
 * Validates ownership before deletion and optionally updates generation statistics.
 *
 * Path Parameters:
 * - id: number - Unique identifier of the flashcard to delete
 *
 * Response (200 OK):
 * {
 *   "message": "Flashcard deleted successfully"
 * }
 */
export default defineEventHandler(
  async (event): Promise<ApiSuccessMessageDTO | ApiErrorResponseDTO> => {
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

      // 3. Create delete command
      const deleteCommand: DeleteFlashcardCommand = {
        id,
        userId,
      }

      // 4. Delete flashcard using service
      const flashcardsService = createFlashcardsService(supabase)
      try {
        await flashcardsService.deleteFlashcard(deleteCommand)
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
        console.error('Error deleting flashcard:', error)
        setResponseStatus(event, 500)
        return {
          error: 'Internal server error',
          details: 'Failed to delete flashcard',
        }
      }

      // 5. Return success response
      setResponseStatus(event, 200)
      return {
        message: 'Flashcard deleted successfully',
      }
    } catch (error) {
      console.error('Unexpected error in delete flashcard endpoint:', error)
      setResponseStatus(event, 500)
      return {
        error: 'Internal server error',
        details: 'An unexpected error occurred',
      }
    }
  }
)
