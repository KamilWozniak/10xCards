import type { CreateGenerationCommand } from '~/types/commands/generation-commands'
import type { GenerationDTO } from '~/types/dto/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'

/**
 * Database service for managing generations
 *
 * Handles CRUD operations for the generations table
 */
export class GenerationsService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Create a new generation record in the database
   *
   * @param command - Generation data to insert
   * @returns Created generation record with generated ID
   * @throws Error if database operation fails
   */
  async create(command: CreateGenerationCommand): Promise<GenerationDTO> {
    const { data, error } = await this.supabase
      .from('generations')
      .insert({
        user_id: command.user_id,
        model: command.model,
        source_text_hash: command.source_text_hash,
        source_text_length: command.source_text_length,
        generated_count: command.generated_count,
        generation_duration: command.generation_duration,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create generation: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data returned from generation insert')
    }

    return data
  }
}

/**
 * Factory function to create GenerationsService instance
 *
 * @param supabase - Supabase client instance
 */
export function createGenerationsService(supabase: SupabaseClient<Database>): GenerationsService {
  return new GenerationsService(supabase)
}
