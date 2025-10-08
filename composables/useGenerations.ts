/**
 * Composable for AI generation management
 * Provides methods for creating generations, logging errors, and fetching statistics
 */

import { createHash } from 'crypto'
import type { 
  Generation, 
  GenerationInsert,
  GenerationErrorLogInsert
} from '~/types/database.types'

export const useGenerations = () => {
  // eslint-disable-next-line no-undef
  const supabase = useSupabaseClient()
  // eslint-disable-next-line no-undef
  const user = useSupabaseUser()

  /**
   * Hash source text for duplicate detection
   */
  const hashSourceText = (text: string): string => {
    return createHash('sha256').update(text).digest('hex')
  }

  /**
   * Check if source text has been used before
   */
  const checkDuplicateSource = async (sourceText: string) => {
    const hash = hashSourceText(sourceText)
    
    const { data, error } = await supabase.rpc('check_duplicate_source', {
      p_source_text_hash: hash
    })

    if (error) {
      console.error('Error checking duplicate source:', error)
      throw error
    }

    return data
  }

  /**
   * Create a new generation record
   */
  const createGeneration = async (generation: Omit<GenerationInsert, 'user_id'>) => {
    if (!user.value) {
      throw new Error('User must be logged in to create generations')
    }

    const { data, error } = await supabase
      .from('generations')
      .insert({
        ...generation,
        user_id: user.value.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating generation:', error)
      throw error
    }

    return data as Generation
  }

  /**
   * Update generation statistics after accepting flashcards
   */
  const updateGenerationStats = async (
    generationId: number,
    acceptedUnedited: number,
    acceptedEdited: number
  ) => {
    const { data, error } = await supabase
      .from('generations')
      .update({
        accepted_unedited_count: acceptedUnedited,
        accepted_edited_count: acceptedEdited,
      })
      .eq('id', generationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating generation stats:', error)
      throw error
    }

    return data as Generation
  }

  /**
   * Bulk accept flashcards from a generation
   */
  const bulkAcceptFlashcards = async (
    generationId: number,
    flashcards: Array<{
      front: string
      back: string
      source: 'ai-full' | 'ai-edited'
    }>
  ) => {
    const { data, error } = await supabase.rpc('bulk_accept_flashcards', {
      p_generation_id: generationId,
      p_flashcards: flashcards,
    })

    if (error) {
      console.error('Error bulk accepting flashcards:', error)
      throw error
    }

    return data
  }

  /**
   * Fetch generation history
   */
  const fetchGenerations = async (options?: {
    limit?: number
    offset?: number
    includeFlashcards?: boolean
  }) => {
    let query = supabase
      .from('generations')
      .select(
        options?.includeFlashcards 
          ? '*, flashcards(*)' 
          : '*'
      )
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching generations:', error)
      throw error
    }

    return data as Generation[]
  }

  /**
   * Log a generation error
   */
  const logGenerationError = async (errorLog: Omit<GenerationErrorLogInsert, 'user_id'>) => {
    if (!user.value) {
      throw new Error('User must be logged in to log errors')
    }

    const { error } = await supabase
      .from('generation_error_logs')
      .insert({
        ...errorLog,
        user_id: user.value.id,
      })

    if (error) {
      console.error('Error logging generation error:', error)
      throw error
    }
  }

  /**
   * Get error frequency statistics
   */
  const getErrorFrequency = async () => {
    const { data, error } = await supabase.rpc('get_error_frequency')

    if (error) {
      console.error('Error fetching error frequency:', error)
      throw error
    }

    return data
  }

  /**
   * Get model performance statistics
   */
  const getModelPerformanceStats = async () => {
    const { data, error } = await supabase.rpc('get_model_performance_stats')

    if (error) {
      console.error('Error fetching model performance stats:', error)
      throw error
    }

    return data
  }

  return {
    hashSourceText,
    checkDuplicateSource,
    createGeneration,
    updateGenerationStats,
    bulkAcceptFlashcards,
    fetchGenerations,
    logGenerationError,
    getErrorFrequency,
    getModelPerformanceStats,
  }
}

