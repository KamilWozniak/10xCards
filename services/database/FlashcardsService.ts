import type { FlashcardDTO, FlashcardCreateData } from '~/types/dto/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'
import type {
  DeleteFlashcardCommand,
  UpdateFlashcardCommand,
} from '~/types/commands/generation-commands'

/**
 * Database service for managing flashcards
 *
 * Handles CRUD operations for the flashcards table
 */
export class FlashcardsService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }
  /**
   * Create multiple flashcards in a single transaction
   *
   * @param flashcards - Array of flashcard data to insert
   * @param userId - ID of the user creating the flashcards
   * @returns Array of created flashcard records with generated IDs
   * @throws Error if database operation fails
   */
  async createMultiple(flashcards: FlashcardCreateData[], userId: string): Promise<FlashcardDTO[]> {
    // Prepare data with user_id for each flashcard
    const flashcardsWithUserId = flashcards.map(flashcard => ({
      ...flashcard,
      user_id: userId,
    }))

    const { data, error } = await this.supabase
      .from('flashcards')
      .insert(flashcardsWithUserId)
      .select()

    if (error) {
      throw new Error(`Failed to create flashcards: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error('No flashcards were created')
    }

    return data
  }

  /**
   * Create a single flashcard
   *
   * @param flashcard - Flashcard data to insert
   * @param userId - ID of the user creating the flashcard
   * @returns Created flashcard record with generated ID
   * @throws Error if database operation fails
   */
  async create(flashcard: FlashcardCreateData, userId: string): Promise<FlashcardDTO> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .insert({
        ...flashcard,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`)
    }

    if (!data) {
      throw new Error('No flashcard was created')
    }

    return data
  }

  /**
   * Validate that a generation belongs to the specified user
   *
   * @param generationId - ID of the generation to validate
   * @param userId - ID of the user to check ownership
   * @returns Promise<boolean> - true if generation belongs to user, false otherwise
   * @throws Error if database operation fails
   */
  async validateGenerationOwnership(generationId: number, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('generations')
      .select('id, user_id')
      .eq('id', generationId)
      .eq('user_id', userId)
      .single()

    if (error) {
      // If generation not found or doesn't belong to user, return false
      if (error.code === 'PGRST116') {
        return false
      }
      throw new Error(`Failed to validate generation ownership: ${error.message}`)
    }

    return !!data
  }

  /**
   * Validate multiple generation IDs belong to the specified user
   *
   * @param generationIds - Array of generation IDs to validate
   * @param userId - ID of the user to check ownership
   * @returns Promise<number[]> - Array of valid generation IDs
   * @throws Error if database operation fails
   */
  async validateMultipleGenerationOwnership(
    generationIds: number[],
    userId: string
  ): Promise<number[]> {
    const { data, error } = await this.supabase
      .from('generations')
      .select('id')
      .in('id', generationIds)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to validate generation ownership: ${error.message}`)
    }

    return data?.map(generation => generation.id) || []
  }

  /**
   * Get flashcards by user ID with optional filtering
   *
   * @param userId - ID of the user
   * @param options - Optional filtering and pagination options
   * @returns Array of flashcard records
   * @throws Error if database operation fails
   */
  async getByUserId(
    userId: string,
    options?: {
      source?: string
      generationId?: number
      limit?: number
      offset?: number
    }
  ): Promise<FlashcardDTO[]> {
    let query = this.supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.source) {
      query = query.eq('source', options.source)
    }

    if (options?.generationId) {
      query = query.eq('generation_id', options.generationId)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get flashcards: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get a single flashcard by ID and user ID
   *
   * @param flashcardId - ID of the flashcard
   * @param userId - ID of the user
   * @returns Flashcard record or null if not found
   * @throws Error if database operation fails
   */
  async getById(flashcardId: number, userId: string): Promise<FlashcardDTO | null> {
    const { data, error } = await this.supabase
      .from('flashcards')
      .select('*')
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get flashcard: ${error.message}`)
    }

    return data
  }

  /**
   * Update a flashcard by ID and user ID
   * Validates ownership before updating and performs partial update of provided fields
   *
   * @param command - Update command containing flashcard ID, user ID, and fields to update
   * @returns Updated flashcard record
   * @throws Error if flashcard not found or database operation fails
   */
  async updateFlashcard(command: UpdateFlashcardCommand): Promise<FlashcardDTO> {
    const { id, user_id, ...updateFields } = command

    // First, check if flashcard exists and belongs to user
    const flashcard = await this.getById(id, user_id)
    if (!flashcard) {
      throw new Error('Flashcard not found or does not belong to user')
    }

    // Update the flashcard with provided fields
    const { data, error } = await this.supabase
      .from('flashcards')
      .update(updateFields)
      .eq('id', id)
      .eq('user_id', user_id) // Extra safety check via RLS
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update flashcard: ${error.message}`)
    }

    if (!data) {
      throw new Error('No flashcard was updated')
    }

    return data
  }

  /**
   * Delete a flashcard by ID and user ID
   * Validates ownership before deletion and optionally updates generation statistics
   *
   * @param command - Delete command containing flashcard ID and user ID
   * @throws Error if flashcard not found or database operation fails
   */
  async deleteFlashcard(command: DeleteFlashcardCommand): Promise<void> {
    const { id, userId } = command

    // First, check if flashcard exists and belongs to user
    const flashcard = await this.getById(id, userId)
    if (!flashcard) {
      throw new Error('Flashcard not found or does not belong to user')
    }

    // If flashcard has generation_id and was accepted (ai-full or ai-edited), update generation stats
    if (
      flashcard.generation_id &&
      (flashcard.source === 'ai-full' || flashcard.source === 'ai-edited')
    ) {
      // Get current generation data to update counters
      const { data: generation, error: fetchError } = await this.supabase
        .from('generations')
        .select('accepted_unedited_count, accepted_edited_count')
        .eq('id', flashcard.generation_id)
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch generation data: ${fetchError.message}`)
      }

      if (generation) {
        // Determine which counter to decrement based on source
        const counterField =
          flashcard.source === 'ai-full' ? 'accepted_unedited_count' : 'accepted_edited_count'
        const currentCount = generation[counterField] || 0
        const newCount = Math.max(0, currentCount - 1) // Ensure doesn't go below 0

        // Update the generation with decremented counter
        const { error: updateError } = await this.supabase
          .from('generations')
          .update({ [counterField]: newCount })
          .eq('id', flashcard.generation_id)
          .eq('user_id', userId)

        if (updateError) {
          throw new Error(`Failed to update generation statistics: ${updateError.message}`)
        }
      }
    }

    // Delete the flashcard
    const { error: deleteError } = await this.supabase
      .from('flashcards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // Extra safety check via RLS

    if (deleteError) {
      throw new Error(`Failed to delete flashcard: ${deleteError.message}`)
    }
  }
}

/**
 * Factory function to create FlashcardsService instance
 *
 * @param supabase - Supabase client instance
 */
export function createFlashcardsService(supabase: SupabaseClient<Database>): FlashcardsService {
  return new FlashcardsService(supabase)
}
