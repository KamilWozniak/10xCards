import type { FlashcardDTO, FlashcardCreateData } from '~/types/dto/types'
import { useSupabase } from '~/composables/useSupabase'

/**
 * Database service for managing flashcards
 *
 * Handles CRUD operations for the flashcards table
 */
export class FlashcardsService {
  /**
   * Create multiple flashcards in a single transaction
   *
   * @param flashcards - Array of flashcard data to insert
   * @param userId - ID of the user creating the flashcards
   * @returns Array of created flashcard records with generated IDs
   * @throws Error if database operation fails
   */
  async createMultiple(flashcards: FlashcardCreateData[], userId: string): Promise<FlashcardDTO[]> {
    const { supabase } = useSupabase()

    // Prepare data with user_id for each flashcard
    const flashcardsWithUserId = flashcards.map(flashcard => ({
      ...flashcard,
      user_id: userId,
    }))

    const { data, error } = await supabase.from('flashcards').insert(flashcardsWithUserId).select()

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
    const { supabase } = useSupabase()

    const { data, error } = await supabase
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
    const { supabase } = useSupabase()

    const { data, error } = await supabase
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
    const { supabase } = useSupabase()

    const { data, error } = await supabase
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
    const { supabase } = useSupabase()

    let query = supabase
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
    const { supabase } = useSupabase()

    const { data, error } = await supabase
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
}

/**
 * Factory function to create FlashcardsService instance
 */
export function createFlashcardsService(): FlashcardsService {
  return new FlashcardsService()
}
