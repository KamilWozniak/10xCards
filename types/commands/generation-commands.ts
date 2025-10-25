/**
 * Command for creating a generation record in the database
 * Contains all necessary data from AI generation process
 */
export interface CreateGenerationCommand {
  user_id: string
  model: string
  source_text_hash: string
  source_text_length: number
  generated_count: number
  generation_duration: number
}

/**
 * Command for logging generation errors
 * Stores AI service failures for debugging and monitoring
 */
export interface CreateGenerationErrorLogCommand {
  user_id: string
  model: string
  source_text_hash: string
  source_text_length: number
  error_code: string
  error_message: string
}

/**
 * Result from AI service generation
 * Contains parsed flashcard proposals and metadata
 */
export interface AIGenerationResult {
  proposals: Array<{
    front: string
    back: string
  }>
  count: number
}

/**
 * Command for deleting a flashcard
 * Contains flashcard ID and user ID for ownership validation
 */
export interface DeleteFlashcardCommand {
  id: number
  userId: string
}

/**
 * Command for updating a flashcard
 * Contains flashcard ID, user ID for ownership validation, and partial update data
 */
export interface UpdateFlashcardCommand {
  id: number
  user_id: string
  front?: string
  back?: string
  source?: 'ai-full' | 'ai-edited' | 'manual'
}
