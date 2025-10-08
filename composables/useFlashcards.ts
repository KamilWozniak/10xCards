/**
 * Composable for flashcard management
 * Provides easy-to-use methods for CRUD operations on flashcards
 */

import type { 
  Flashcard, 
  FlashcardInsert, 
  FlashcardUpdate,
  FlashcardWithGeneration 
} from '~/types/database.types'

export const useFlashcards = () => {
  // eslint-disable-next-line no-undef
  const supabase = useSupabaseClient()
  // eslint-disable-next-line no-undef
  const user = useSupabaseUser()

  /**
   * Fetch all flashcards for the current user
   */
  const fetchFlashcards = async (options?: {
    includeGeneration?: boolean
    limit?: number
    offset?: number
    source?: 'manual' | 'ai-full' | 'ai-edited'
  }) => {
    let query = supabase
      .from('flashcards')
      .select(options?.includeGeneration ? '*, generation:generations(*)' : '*')
      .order('created_at', { ascending: false })

    if (options?.source) {
      query = query.eq('source', options.source)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching flashcards:', error)
      throw error
    }

    return data as Flashcard[] | FlashcardWithGeneration[]
  }

  /**
   * Fetch a single flashcard by ID
   */
  const fetchFlashcard = async (id: number) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*, generation:generations(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching flashcard:', error)
      throw error
    }

    return data as FlashcardWithGeneration
  }

  /**
   * Create a new flashcard manually
   */
  const createFlashcard = async (flashcard: Omit<FlashcardInsert, 'user_id'>) => {
    if (!user.value) {
      throw new Error('User must be logged in to create flashcards')
    }

    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        ...flashcard,
        user_id: user.value.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating flashcard:', error)
      throw error
    }

    return data as Flashcard
  }

  /**
   * Update an existing flashcard
   */
  const updateFlashcard = async (id: number, updates: FlashcardUpdate) => {
    const { data, error } = await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating flashcard:', error)
      throw error
    }

    return data as Flashcard
  }

  /**
   * Delete a flashcard
   */
  const deleteFlashcard = async (id: number) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting flashcard:', error)
      throw error
    }
  }

  /**
   * Bulk delete flashcards
   */
  const deleteFlashcards = async (ids: number[]) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Error deleting flashcards:', error)
      throw error
    }
  }

  /**
   * Count total flashcards
   */
  const countFlashcards = async (source?: 'manual' | 'ai-full' | 'ai-edited') => {
    let query = supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })

    if (source) {
      query = query.eq('source', source)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error counting flashcards:', error)
      throw error
    }

    return count || 0
  }

  return {
    fetchFlashcards,
    fetchFlashcard,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    deleteFlashcards,
    countFlashcards,
  }
}

